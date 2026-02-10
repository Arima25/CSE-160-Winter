// --- Global Variables ---
let canvas, gl;
let a_Position, a_UV, a_Normal;
let u_FragColor, u_PointSize, u_ModelMatrix;
let u_GlobalRotateMatrix, u_ViewMatrix, u_ProjectionMatrix;
let u_WhichTexture, u_Sampler0;
let u_LightPos, u_CameraPos, u_LightOn, u_LightColor;
let u_NormalVisualization;
let u_SpotlightOn, u_SpotlightPos, u_SpotlightDir, u_SpotlightCutoff;

let g_globalAngle = 0;    // Y-axis rotation (horizontal mouse / slider)
let g_globalAngleX = 0;   // X-axis rotation (vertical mouse)

// Joint angles
let g_rightArmAngle = 0;
let g_rightForearmAngle = 0;
let g_leftArmAngle = 0;
let g_leftLegAngle = 0;
let g_leftShinAngle = 0;
let g_leftFootAngle = 0;
let g_staffOffset = 0;

// Animation
let g_animationOn = true;
let g_seconds = 0;
let g_startTime = performance.now();

// Poke Animation (Staff to Ear)
let g_pokeAnimation = false;
let g_staffHidden = false;
let g_pokeProgress = 0;
let g_pokeStartTime = 0;
const POKE_DURATION = 1.5;

// Lighting
let g_lightPos = [0, 1, -2];
let g_lightOn = true;
let g_lightColor = [1.0, 1.0, 1.0];
let g_normalVisualization = false;
let g_lightAnimation = true;

// Spotlight
let g_spotlightOn = false;
let g_spotlightPos = [0, 2, 0];
let g_spotlightDir = [0, -1, 0];
let g_spotlightCutoff = 0.9; // cos(angle)

// OBJ Model
let g_pineapple = null;

// Camera
let g_cameraPos = [0, 0, 3];

// Wukong Colors
const C_GOLD = [1.0, 0.85, 0.0, 1.0];
const C_RED = [0.8, 0.1, 0.1, 1.0];
const C_DARK = [0.2, 0.2, 0.25, 1.0];
const C_FUR = [0.65, 0.45, 0.25, 1.0];
const C_SKIN = [0.9, 0.75, 0.65, 1.0];
const C_BLACK = [0.05, 0.05, 0.05, 1.0];

// --- Shaders with Phong Lighting ---
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec3 v_VertPos;
  
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    
    // Transform normal to world coordinates
    v_Normal = normalize(vec3(u_ModelMatrix * vec4(a_Normal, 0.0)));
    
    // Get vertex position in world coordinates
    v_VertPos = vec3(u_ModelMatrix * a_Position);
  }`;

var FSHADER_SOURCE = `
  precision mediump float;
  
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec3 v_VertPos;
  
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform int u_WhichTexture;
  
  uniform vec3 u_LightPos;
  uniform vec3 u_CameraPos;
  uniform bool u_LightOn;
  uniform vec3 u_LightColor;
  uniform bool u_NormalVisualization;
  
  // Spotlight
  uniform bool u_SpotlightOn;
  uniform vec3 u_SpotlightPos;
  uniform vec3 u_SpotlightDir;
  uniform float u_SpotlightCutoff;
  
  void main() {
    // Normal visualization mode
    if (u_NormalVisualization) {
      gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
      return;
    }
    
    // Get base color based on texture setting
    vec4 baseColor;
    if (u_WhichTexture == -2) {
      baseColor = u_FragColor;  // Use solid color
    } else if (u_WhichTexture == -1) {
      baseColor = vec4(v_UV, 1.0, 1.0);  // Use UV debug
    } else if (u_WhichTexture == 0) {
      baseColor = texture2D(u_Sampler0, v_UV);  // Use texture
    } else {
      baseColor = vec4(1.0, 0.2, 0.2, 1.0);  // Error: red
    }
    
    if (!u_LightOn) {
      gl_FragColor = baseColor;
      return;
    }
    
    // Lighting calculations (Phong shading)
    vec3 lightVector = u_LightPos - v_VertPos;
    float r = length(lightVector);
    
    // N dot L (diffuse)
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);
    
    // Reflection for specular
    vec3 R = reflect(-L, N);
    
    // Eye direction
    vec3 E = normalize(u_CameraPos - v_VertPos);
    
    // Specular
    float specular = pow(max(dot(E, R), 0.0), 32.0);
    
    // Attenuation (optional, can adjust)
    float attenuation = 1.0 / (1.0 + 0.1 * r + 0.01 * r * r);
    
    // Ambient
    vec3 ambient = 0.2 * baseColor.rgb;
    
    // Diffuse
    vec3 diffuse = u_LightColor * baseColor.rgb * nDotL * attenuation;
    
    // Specular (use light color)
    vec3 specularColor = u_LightColor * specular * attenuation * 0.5;
    
    vec3 finalColor = ambient + diffuse + specularColor;
    
    // Spotlight contribution
    if (u_SpotlightOn) {
      vec3 spotLightVector = u_SpotlightPos - v_VertPos;
      vec3 spotL = normalize(spotLightVector);
      vec3 spotDir = normalize(u_SpotlightDir);
      
      float spotCos = dot(-spotL, spotDir);
      
      if (spotCos > u_SpotlightCutoff) {
        // Inside spotlight cone
        float spotIntensity = (spotCos - u_SpotlightCutoff) / (1.0 - u_SpotlightCutoff);
        spotIntensity = pow(spotIntensity, 2.0); // Smooth falloff
        
        float spotNDotL = max(dot(N, spotL), 0.0);
        vec3 spotR = reflect(-spotL, N);
        float spotSpec = pow(max(dot(E, spotR), 0.0), 32.0);
        
        float spotR2 = length(spotLightVector);
        float spotAtten = 1.0 / (1.0 + 0.05 * spotR2);
        
        finalColor += spotIntensity * spotAtten * (baseColor.rgb * spotNDotL + 0.5 * spotSpec);
      }
    }
    
    gl_FragColor = vec4(finalColor, baseColor.a);
  }`;

// --- Setup ---
function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) return;
    
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) return;

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    
    u_WhichTexture = gl.getUniformLocation(gl.program, 'u_WhichTexture');
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    
    // Lighting uniforms
    u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
    u_CameraPos = gl.getUniformLocation(gl.program, 'u_CameraPos');
    u_LightOn = gl.getUniformLocation(gl.program, 'u_LightOn');
    u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    u_NormalVisualization = gl.getUniformLocation(gl.program, 'u_NormalVisualization');
    
    // Spotlight uniforms
    u_SpotlightOn = gl.getUniformLocation(gl.program, 'u_SpotlightOn');
    u_SpotlightPos = gl.getUniformLocation(gl.program, 'u_SpotlightPos');
    u_SpotlightDir = gl.getUniformLocation(gl.program, 'u_SpotlightDir');
    u_SpotlightCutoff = gl.getUniformLocation(gl.program, 'u_SpotlightCutoff');
    
    // Set default projection matrix
    var projMat = new Matrix4();
    projMat.setPerspective(60, canvas.width/canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
    
    // Set default view matrix
    var viewMat = new Matrix4();
    viewMat.setLookAt(0, 0, 3, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionForHtmlUI();
    
    console.log('main() started');
    
    // Load OBJ model (pineapple)
    g_pineapple = new OBJModel();
    g_pineapple.load(gl, 'pinapple.obj').then(() => {
        console.log('Pineapple loaded, vertices:', g_pineapple.numVertices);
        // Set transform AFTER loading
        g_pineapple.matrix.setTranslate(0.6, -0.4, 0);
        g_pineapple.matrix.rotate(-90, 1, 0, 0);  // Stand upright
        g_pineapple.matrix.scale(0.03, 0.03, 0.03);  // Scale down from cm
    });
    g_pineapple.color = [1.0, 0.85, 0.2, 1.0];  // Yellow-orange
    
    gl.clearColor(0.1, 0.1, 0.15, 1.0);
    requestAnimationFrame(tick);
}

// Performance tracking
var g_frameCount = 0;
var g_lastFPSUpdate = 0;
var g_fps = 0;

function tick() {
    g_seconds = (performance.now() - g_startTime) / 1000.0;
    
    // Calculate FPS
    g_frameCount++;
    if (g_seconds - g_lastFPSUpdate >= 1.0) {
        g_fps = g_frameCount / (g_seconds - g_lastFPSUpdate);
        g_frameCount = 0;
        g_lastFPSUpdate = g_seconds;
        
        var fpsDisplay = document.getElementById('fpsDisplay');
        if (fpsDisplay) {
            fpsDisplay.textContent = 'FPS: ' + g_fps.toFixed(1);
            fpsDisplay.className = 'fps-display';
            if (g_fps < 10) {
                fpsDisplay.classList.add('bad');
            } else if (g_fps < 30) {
                fpsDisplay.classList.add('slow');
            }
        }
    }
    
    updateAnimationAngles();
    renderScene();
    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    // Animate light position
    if (g_lightAnimation) {
        g_lightPos[0] = 2 * Math.cos(g_seconds);
        g_lightPos[2] = 2 * Math.sin(g_seconds);
    }
    
    // Handle poke animation
    if (g_pokeAnimation) {
        var elapsed = g_seconds - g_pokeStartTime;
        g_pokeProgress = Math.min(elapsed / POKE_DURATION, 1.0);
        
        var t = g_pokeProgress;
        var eased = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2;
        
        if (g_staffHidden) {
            eased = 1 - eased;
        }
        
        g_rightArmAngle = eased * -160;
        g_rightForearmAngle = eased * 120;
        
        if (g_pokeProgress >= 1.0) {
            g_pokeAnimation = false;
            if (!g_staffHidden) {
                g_staffHidden = true;
            } else {
                g_staffHidden = false;
            }
        }
        return;
    }
    
    if (g_staffHidden) {
        g_rightArmAngle = 0;
        g_rightForearmAngle = 0;
        return;
    }
    
    if (g_animationOn) {
        let sway = Math.sin(g_seconds * 2);
        g_rightArmAngle = 5 + sway * 5; 
        g_leftArmAngle = -5 + sway * 5;
        g_staffOffset = sway * 5;
        g_leftLegAngle = sway * 2;
    }
}

function renderScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update camera position
    gl.uniform3f(u_CameraPos, g_cameraPos[0], g_cameraPos[1], g_cameraPos[2]);
    
    // Update lighting uniforms
    gl.uniform3f(u_LightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform1i(u_LightOn, g_lightOn);
    gl.uniform3f(u_LightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
    gl.uniform1i(u_NormalVisualization, g_normalVisualization);
    
    // Spotlight uniforms
    gl.uniform1i(u_SpotlightOn, g_spotlightOn);
    gl.uniform3f(u_SpotlightPos, g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
    gl.uniform3f(u_SpotlightDir, g_spotlightDir[0], g_spotlightDir[1], g_spotlightDir[2]);
    gl.uniform1f(u_SpotlightCutoff, g_spotlightCutoff);

    // Global rotation
    var globalRotMat = new Matrix4();
    globalRotMat.rotate(g_globalAngleX, 1, 0, 0);
    globalRotMat.rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Draw light source marker (small yellow cube)
    var lightMat = new Matrix4();
    lightMat.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    lightMat.scale(-0.1, -0.1, -0.1);
    lightMat.translate(-0.5, -0.5, -0.5);
    drawCube(lightMat, [1, 1, 0, 1]);
    
    // Draw spotlight marker if enabled
    if (g_spotlightOn) {
        var spotMat = new Matrix4();
        spotMat.translate(g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
        spotMat.scale(-0.08, -0.08, -0.08);
        spotMat.translate(-0.5, -0.5, -0.5);
        drawCube(spotMat, [1, 0.5, 0, 1]);
    }
    
    // Draw a ground plane
    var groundMat = new Matrix4();
    groundMat.translate(0, -0.75, 0);
    groundMat.scale(3, 0.01, 3);
    groundMat.translate(-0.5, 0, -0.5);
    drawCube(groundMat, [0.3, 0.3, 0.35, 1.0]);
    
    // Draw a sphere for testing lighting
    var sphereMat = new Matrix4();
    sphereMat.translate(-0.8, 0, 0);
    sphereMat.scale(0.5, 0.5, 0.5);
    drawSphere(sphereMat, [0.2, 0.6, 1.0, 1.0], 16, 16);
    
    // Draw OBJ model (pineapple) with lighting
    // Pass 'a_UV' as the 4th argument
    if (g_pineapple && g_pineapple.isLoaded) {
        g_pineapple.render(gl, a_Position, a_Normal, a_UV, u_ModelMatrix, u_FragColor, u_WhichTexture);
    }
    // ================= SUN WUKONG MODEL =================
    drawWukong();
}

function drawWukong() {
    // --- TORSO (Root) ---
    var bodyMat = new Matrix4();
    bodyMat.translate(-0.15, -0.2, 0.0);
    var bodyCoord = new Matrix4(bodyMat);
    
    // Main Armor Plate
    bodyMat.scale(0.3, 0.45, 0.2);
    drawCube(bodyMat, C_DARK);

    // Chest Gold Plate
    var chestMat = new Matrix4(bodyCoord);
    chestMat.translate(0.025, 0.2, -0.01); 
    chestMat.scale(0.25, 0.2, 0.05);
    drawCube(chestMat, C_GOLD);

    // Sash/Belt
    var beltMat = new Matrix4(bodyCoord);
    beltMat.translate(-0.01, 0.0, -0.01);
    beltMat.scale(0.32, 0.08, 0.22);
    drawCube(beltMat, C_RED);

    // --- HEAD ---
    var headMat = new Matrix4(bodyCoord);
    headMat.translate(0.05, 0.45, 0.0);
    if(g_animationOn) headMat.rotate(Math.sin(g_seconds*3)*5, 1, 0, 0);
    var headCoord = new Matrix4(headMat);

    headMat.scale(0.2, 0.22, 0.2);
    drawCube(headMat, C_FUR);

    // Face
    var faceMat = new Matrix4(headCoord);
    faceMat.translate(0.03, 0.03, -0.03);
    faceMat.scale(0.14, 0.14, 0.05);
    drawCube(faceMat, C_SKIN);

    // Snout
    var snoutMat = new Matrix4(headCoord);
    snoutMat.translate(0.05, 0.02, -0.05);
    snoutMat.scale(0.1, 0.08, 0.05);
    drawCube(snoutMat, C_SKIN);

    // Eyes
    var lEyeMat = new Matrix4(headCoord);
    lEyeMat.translate(0.03, 0.12, -0.035);
    lEyeMat.scale(0.04, 0.04, 0.02);
    drawCube(lEyeMat, C_BLACK);

    var rEyeMat = new Matrix4(headCoord);
    rEyeMat.translate(0.13, 0.12, -0.035);
    rEyeMat.scale(0.04, 0.04, 0.02);
    drawCube(rEyeMat, C_BLACK);

    // Eye whites
    var lEyeWhite = new Matrix4(headCoord);
    lEyeWhite.translate(0.025, 0.11, -0.025);
    lEyeWhite.scale(0.055, 0.055, 0.02);
    drawCube(lEyeWhite, [1.0, 1.0, 0.95, 1.0]);

    var rEyeWhite = new Matrix4(headCoord);
    rEyeWhite.translate(0.12, 0.11, -0.025);
    rEyeWhite.scale(0.055, 0.055, 0.02);
    drawCube(rEyeWhite, [1.0, 1.0, 0.95, 1.0]);

    // Nose
    var noseMat = new Matrix4(headCoord);
    noseMat.translate(0.08, 0.05, -0.06);
    noseMat.scale(0.04, 0.03, 0.02);
    drawCube(noseMat, [0.4, 0.25, 0.2, 1.0]);

    // Mouth
    var mouthMat = new Matrix4(headCoord);
    mouthMat.translate(0.06, 0.01, -0.06);
    mouthMat.scale(0.08, 0.015, 0.02);
    drawCube(mouthMat, [0.3, 0.15, 0.1, 1.0]);

    // Cheeks
    var lCheekMat = new Matrix4(headCoord);
    lCheekMat.translate(-0.01, 0.02, -0.01);
    lCheekMat.scale(0.05, 0.12, 0.08);
    drawCube(lCheekMat, C_FUR);

    var rCheekMat = new Matrix4(headCoord);
    rCheekMat.translate(0.16, 0.02, -0.01);
    rCheekMat.scale(0.05, 0.12, 0.08);
    drawCube(rCheekMat, C_FUR);

    // Crown
    var crownMat = new Matrix4(headCoord);
    crownMat.translate(-0.01, 0.18, -0.01);
    crownMat.scale(0.22, 0.04, 0.22);
    drawCube(crownMat, C_GOLD);

    // Feathers
    var numSegments = 5;
    var segmentLength = 0.15;
    
    var lFeatherBase = new Matrix4(headCoord);
    lFeatherBase.translate(0.05, 0.22, 0.08);
    if(g_animationOn) lFeatherBase.rotate(Math.sin(g_seconds*4)*10, 1, 0, 0);
    lFeatherBase.rotate(-15, 0, 0, 1);
    lFeatherBase.rotate(-20, 1, 0, 0);
    
    var lFeatherCoord = new Matrix4(lFeatherBase);
    for (var i = 0; i < numSegments; i++) {
        var lSeg = new Matrix4(lFeatherCoord);
        var taper = 1.0 - (i / numSegments) * 0.7;
        lSeg.scale(0.02 * taper, segmentLength, 0.01 * taper);
        var colorFade = 1.0 - (i / numSegments) * 0.3;
        drawCube(lSeg, [0.8 * colorFade, 0.1 * colorFade, 0.1 * colorFade, 1.0]);
        lFeatherCoord.translate(0.0, segmentLength, 0.0);
        lFeatherCoord.rotate(-4 - i * 4, 0, 0, 1);
        lFeatherCoord.rotate(3, 1, 0, 0);
    }

    var rFeatherBase = new Matrix4(headCoord);
    rFeatherBase.translate(0.15, 0.22, 0.08);
    if(g_animationOn) rFeatherBase.rotate(Math.sin(g_seconds*4 + 1)*10, 1, 0, 0);
    rFeatherBase.rotate(15, 0, 0, 1);
    rFeatherBase.rotate(-20, 1, 0, 0);
    
    var rFeatherCoord = new Matrix4(rFeatherBase);
    for (var i = 0; i < numSegments; i++) {
        var rSeg = new Matrix4(rFeatherCoord);
        var taper = 1.0 - (i / numSegments) * 0.7;
        rSeg.scale(0.02 * taper, segmentLength, 0.01 * taper);
        var colorFade = 1.0 - (i / numSegments) * 0.3;
        drawCube(rSeg, [0.8 * colorFade, 0.1 * colorFade, 0.1 * colorFade, 1.0]);
        rFeatherCoord.translate(0.0, segmentLength, 0.0);
        rFeatherCoord.rotate(4 + i * 4, 0, 0, 1);
        rFeatherCoord.rotate(3, 1, 0, 0);
    }

    // --- RIGHT ARM ---
    var rArmMat = new Matrix4(bodyCoord);
    rArmMat.translate(0.3, 0.35, 0.1);
    rArmMat.rotate(g_rightArmAngle, 1, 0, 0);
    var rArmCoord = new Matrix4(rArmMat);

    var rPauldron = new Matrix4(rArmCoord);
    rPauldron.translate(-0.08, -0.08, -0.08);
    rPauldron.scale(0.16, 0.16, 0.16);
    drawSphere(rPauldron, C_GOLD, 6, 8);

    var rUpperArm = new Matrix4(rArmCoord);
    rUpperArm.translate(0.0, -0.2, 0.0);
    rUpperArm.scale(0.08, 0.2, 0.08);
    drawCylinder(rUpperArm, C_DARK, 10);

    var rForeMat = new Matrix4(rArmCoord);
    rForeMat.translate(0.0, -0.2, 0.0);
    rForeMat.rotate(g_rightForearmAngle - 45, 1, 0, 0);
    var rForeCoord = new Matrix4(rForeMat);
    
    var rForearmDraw = new Matrix4(rForeCoord);
    rForearmDraw.translate(0.0, -0.2, 0.0);
    rForearmDraw.scale(0.07, 0.2, 0.07);
    drawCylinder(rForearmDraw, C_DARK, 10);

    var rHandMat = new Matrix4(rForeCoord);
    rHandMat.translate(-0.04, -0.32, -0.04);
    var rHandCoord = new Matrix4(rHandMat);
    rHandMat.scale(0.1, 0.1, 0.1);
    drawSphere(rHandMat, C_SKIN, 6, 8);

    // Staff
    if (!g_staffHidden || g_pokeAnimation) {
        var staffMat = new Matrix4(rHandCoord);
        staffMat.translate(0.05, 0.05, 0.05);
        staffMat.rotate(90 + g_staffOffset, 0, 0, 1);
        staffMat.rotate(90, 1, 0, 0);
        staffMat.translate(0.0, -0.7, 0.0);
        
        var staffScale = 1.0;
        if (g_pokeAnimation) {
            var t = g_pokeProgress;
            var eased = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2;
            if (g_staffHidden) {
                staffScale = eased;
            } else {
                staffScale = 1.0 - eased * 0.95;
            }
        }
        
        var staffHandle = new Matrix4(staffMat);
        staffHandle.scale(0.03 * staffScale, 1.4 * staffScale, 0.03 * staffScale);
        drawCylinder(staffHandle, C_BLACK, 12);

        var tip1 = new Matrix4(staffMat);
        tip1.translate(0.0, 1.3 * staffScale, 0.0);
        tip1.scale(0.05 * staffScale, 0.2 * staffScale, 0.05 * staffScale);
        drawCylinder(tip1, C_GOLD, 12);

        var tip2 = new Matrix4(staffMat);
        tip2.translate(0.0, -0.1 * staffScale, 0.0);
        tip2.scale(0.05 * staffScale, 0.2 * staffScale, 0.05 * staffScale);
        drawCylinder(tip2, C_GOLD, 12);
    }
    
    if (g_staffHidden && !g_pokeAnimation) {
        var earStaff = new Matrix4(headCoord);
        earStaff.translate(0.18, 0.1, 0.08);
        earStaff.rotate(90, 0, 0, 1);
        earStaff.scale(0.008, 0.05, 0.008);
        drawCylinder(earStaff, C_GOLD, 8);
    }

    // --- LEFT ARM ---
    var lArmMat = new Matrix4(bodyCoord);
    lArmMat.translate(-0.02, 0.35, 0.1);
    lArmMat.rotate(g_leftArmAngle, 1, 0, 0);
    var lArmCoord = new Matrix4(lArmMat);

    var lPauldron = new Matrix4(lArmCoord);
    lPauldron.translate(-0.1, -0.08, -0.08);
    lPauldron.scale(0.16, 0.16, 0.16);
    drawSphere(lPauldron, C_GOLD, 6, 8);

    var lUpperArm = new Matrix4(lArmCoord);
    lUpperArm.translate(-0.08, -0.25, 0.0);
    lUpperArm.scale(0.08, 0.25, 0.08);
    drawCylinder(lUpperArm, C_DARK, 10);

    var lForeMat = new Matrix4(lArmCoord);
    lForeMat.translate(-0.08, -0.25, 0.0);
    lForeMat.rotate(-20, 1, 0, 0);
    var lForeCoord = new Matrix4(lForeMat);
    
    var lForearmDraw = new Matrix4(lForeCoord);
    lForearmDraw.translate(0.0, -0.2, 0.0);
    lForearmDraw.scale(0.07, 0.2, 0.07);
    drawCylinder(lForearmDraw, C_DARK, 10);

    var lHandMat = new Matrix4(lForeCoord);
    lHandMat.translate(-0.04, -0.44, -0.02);
    lHandMat.scale(0.1, 0.1, 0.1);
    drawSphere(lHandMat, C_SKIN, 6, 8);

    // --- LEGS ---
    var lThighMat = new Matrix4(bodyCoord);
    lThighMat.translate(0.04, 0.0, 0.1);
    lThighMat.rotate(g_leftLegAngle, 1, 0, 0);
    var lThighCoord = new Matrix4(lThighMat);
    
    var lThighDraw = new Matrix4(lThighCoord);
    lThighDraw.translate(0.0, -0.25, 0.0);
    lThighDraw.scale(0.1, 0.25, 0.1);
    drawCylinder(lThighDraw, C_RED, 10);

    var lShinMat = new Matrix4(lThighCoord);
    lShinMat.translate(0.0, -0.25, 0.0);
    lShinMat.rotate(g_leftShinAngle, 1, 0, 0);
    var lShinCoord = new Matrix4(lShinMat);
    
    var lShinDraw = new Matrix4(lShinCoord);
    lShinDraw.translate(0.0, -0.25, 0.0);
    lShinDraw.scale(0.09, 0.25, 0.09);
    drawCylinder(lShinDraw, C_GOLD, 10);

    var lFootMat = new Matrix4(lShinCoord);
    lFootMat.translate(0.0, -0.25, 0.0);
    lFootMat.rotate(g_leftFootAngle, 1, 0, 0);
    lFootMat.translate(-0.045, 0, 0);
    lFootMat.scale(0.09, 0.05, 0.15);
    lFootMat.translate(0, 0, -0.5);
    drawCube(lFootMat, C_BLACK);

    var rThighMat = new Matrix4(bodyCoord);
    rThighMat.translate(0.2, 0.0, 0.1);
    var rThighCoord = new Matrix4(rThighMat);
    
    var rThighDraw = new Matrix4(rThighCoord);
    rThighDraw.translate(0.0, -0.25, 0.0);
    rThighDraw.scale(0.1, 0.25, 0.1);
    drawCylinder(rThighDraw, C_RED, 10);

    var rShinMat = new Matrix4(rThighCoord);
    rShinMat.translate(0.0, -0.25, 0.0);
    var rShinCoord = new Matrix4(rShinMat);
    
    var rShinDraw = new Matrix4(rShinCoord);
    rShinDraw.translate(0.0, -0.25, 0.0);
    rShinDraw.scale(0.09, 0.25, 0.09);
    drawCylinder(rShinDraw, C_GOLD, 10);

    var rFootMat = new Matrix4(rShinCoord);
    rFootMat.translate(0.0, -0.25, 0.0);
    rFootMat.translate(-0.045, 0, 0);
    rFootMat.scale(0.09, 0.05, 0.15);
    rFootMat.translate(0, 0, -0.5);
    drawCube(rFootMat, C_BLACK);
}

// --- UI Actions ---
function addActionForHtmlUI(){
    // Animation Toggle
    var animOnBtn = document.getElementById('animationOnButton');
    var animOffBtn = document.getElementById('animationOffButton');
    if (animOnBtn) animOnBtn.onclick = function() { g_animationOn = true; this.classList.add('active'); animOffBtn.classList.remove('active'); };
    if (animOffBtn) animOffBtn.onclick = function() { g_animationOn = false; this.classList.add('active'); animOnBtn.classList.remove('active'); };

    // Lighting Toggle
    var lightOnBtn = document.getElementById('lightingOnButton');
    var lightOffBtn = document.getElementById('lightingOffButton');
    if (lightOnBtn) lightOnBtn.onclick = function() { g_lightOn = true; this.classList.add('active'); lightOffBtn.classList.remove('active'); };
    if (lightOffBtn) lightOffBtn.onclick = function() { g_lightOn = false; this.classList.add('active'); lightOnBtn.classList.remove('active'); };
    
    // Normal Visualization Toggle  
    var normalOnBtn = document.getElementById('normalOnButton');
    var normalOffBtn = document.getElementById('normalOffButton');
    if (normalOnBtn) normalOnBtn.onclick = function() { g_normalVisualization = true; this.classList.add('active'); normalOffBtn.classList.remove('active'); };
    if (normalOffBtn) normalOffBtn.onclick = function() { g_normalVisualization = false; this.classList.add('active'); normalOnBtn.classList.remove('active'); };
    
    // Light Animation Toggle
    var lightAnimOnBtn = document.getElementById('lightAnimOnButton');
    var lightAnimOffBtn = document.getElementById('lightAnimOffButton');
    if (lightAnimOnBtn) lightAnimOnBtn.onclick = function() { g_lightAnimation = true; this.classList.add('active'); lightAnimOffBtn.classList.remove('active'); };
    if (lightAnimOffBtn) lightAnimOffBtn.onclick = function() { g_lightAnimation = false; this.classList.add('active'); lightAnimOnBtn.classList.remove('active'); };
    
    // Spotlight Toggle
    var spotOnBtn = document.getElementById('spotlightOnButton');
    var spotOffBtn = document.getElementById('spotlightOffButton');
    if (spotOnBtn) spotOnBtn.onclick = function() { g_spotlightOn = true; this.classList.add('active'); spotOffBtn.classList.remove('active'); };
    if (spotOffBtn) spotOffBtn.onclick = function() { g_spotlightOn = false; this.classList.add('active'); spotOnBtn.classList.remove('active'); };

    // Light Position Sliders
    var lightXSlider = document.getElementById('lightXSlider');
    var lightYSlider = document.getElementById('lightYSlider');
    var lightZSlider = document.getElementById('lightZSlider');
    if (lightXSlider) lightXSlider.addEventListener('input', function() { g_lightPos[0] = parseFloat(this.value); document.getElementById('lightXValue').textContent = this.value; });
    if (lightYSlider) lightYSlider.addEventListener('input', function() { g_lightPos[1] = parseFloat(this.value); document.getElementById('lightYValue').textContent = this.value; });
    if (lightZSlider) lightZSlider.addEventListener('input', function() { g_lightPos[2] = parseFloat(this.value); document.getElementById('lightZValue').textContent = this.value; });
    
    // Light Color Sliders
    var lightRSlider = document.getElementById('lightRSlider');
    var lightGSlider = document.getElementById('lightGSlider');
    var lightBSlider = document.getElementById('lightBSlider');
    if (lightRSlider) lightRSlider.addEventListener('input', function() { g_lightColor[0] = parseFloat(this.value); document.getElementById('lightRValue').textContent = this.value; });
    if (lightGSlider) lightGSlider.addEventListener('input', function() { g_lightColor[1] = parseFloat(this.value); document.getElementById('lightGValue').textContent = this.value; });
    if (lightBSlider) lightBSlider.addEventListener('input', function() { g_lightColor[2] = parseFloat(this.value); document.getElementById('lightBValue').textContent = this.value; });

    // Mouse rotation control
    var isDragging = false;
    var lastMouseX = 0;
    var lastMouseY = 0;
    
    canvas.onmousedown = function(ev) {
        if (ev.shiftKey) {
            if (!g_pokeAnimation) {
                g_pokeAnimation = true;
                g_pokeStartTime = g_seconds;
                g_pokeProgress = 0;
            }
            return;
        }
        isDragging = true;
        lastMouseX = ev.clientX;
        lastMouseY = ev.clientY;
    };
    
    canvas.onmouseup = function(ev) { isDragging = false; };
    canvas.onmouseleave = function(ev) { isDragging = false; };
    
    canvas.onmousemove = function(ev) {
        if (isDragging) {
            var deltaX = ev.clientX - lastMouseX;
            var deltaY = ev.clientY - lastMouseY;
            g_globalAngle += deltaX * 0.5;
            g_globalAngleX += deltaY * 0.5;
            if (g_globalAngleX > 90) g_globalAngleX = 90;
            if (g_globalAngleX < -90) g_globalAngleX = -90;
            lastMouseX = ev.clientX;
            lastMouseY = ev.clientY;
            
            var angleSlider = document.getElementById('angleSlider');
            var angleValue = document.getElementById('angleValue');
            if (angleSlider) angleSlider.value = g_globalAngle;
            if (angleValue) angleValue.textContent = Math.round(g_globalAngle);
        }
    };

    // Global Rotate
    var angleSlider = document.getElementById('angleSlider');
    if (angleSlider) angleSlider.addEventListener('input', function() { 
        g_globalAngle = parseFloat(this.value); 
        document.getElementById('angleValue').textContent = this.value;
    });
    
    // Joint sliders
    var rightArmSlider = document.getElementById('rightArmSlider');
    if (rightArmSlider) rightArmSlider.addEventListener('input', function() { 
        g_rightArmAngle = parseFloat(this.value); 
        document.getElementById('rightArmValue').textContent = this.value;
    });
    var rightForearmSlider = document.getElementById('rightForearmSlider');
    if (rightForearmSlider) rightForearmSlider.addEventListener('input', function() { 
        g_rightForearmAngle = parseFloat(this.value); 
        document.getElementById('rightForearmValue').textContent = this.value;
    });
    var leftArmSlider = document.getElementById('leftArmSlider');
    if (leftArmSlider) leftArmSlider.addEventListener('input', function() { 
        g_leftArmAngle = parseFloat(this.value); 
        document.getElementById('leftArmValue').textContent = this.value;
    });
    var leftLegSlider = document.getElementById('leftLegSlider');
    if (leftLegSlider) leftLegSlider.addEventListener('input', function() { 
        g_leftLegAngle = parseFloat(this.value); 
        document.getElementById('leftLegValue').textContent = this.value;
    });
    var leftShinSlider = document.getElementById('leftShinSlider');
    if (leftShinSlider) leftShinSlider.addEventListener('input', function() { 
        g_leftShinAngle = parseFloat(this.value); 
        document.getElementById('leftShinValue').textContent = this.value;
    });
    var leftFootSlider = document.getElementById('leftFootSlider');
    if (leftFootSlider) leftFootSlider.addEventListener('input', function() { 
        g_leftFootAngle = parseFloat(this.value); 
        document.getElementById('leftFootValue').textContent = this.value;
    });
}
