// --- Global Variables ---
let canvas, gl;
let a_Position, a_UV;
let u_FragColor, u_PointSize, u_ModelMatrix;
let u_ProjectionMatrix, u_ViewMatrix, u_GlobalRotateMatrix;
let u_Sampler, u_whichTexture;

let g_camera;
let g_globalAngle = 0;    // Y-axis rotation
let g_globalAngleX = 0;   // X-axis rotation (up/down)

// Snow System
let g_snowParticles = [];
const MAX_SNOW = 1500;
let g_snowCube = null;
let g_snowEnabled = true;

// Joint angles (Keep Wukong)
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

// Poke Animation (Wukong)
let g_pokeAnimation = false;
let g_swingAnimation = false; // New animation state
let g_swingStartTime = 0;
let g_staffHidden = false;
let g_pokeProgress = 0;
let g_pokeStartTime = 0;
const POKE_DURATION = 1.5;
let g_treeShake = 0; // Magnitude of tree shake

// Wukong Colors
const C_GOLD = [1.0, 0.85, 0.0, 1.0];
const C_RED = [0.8, 0.1, 0.1, 1.0];
const C_DARK = [0.2, 0.2, 0.25, 1.0];
const C_FUR = [0.65, 0.45, 0.25, 1.0];
const C_SKIN = [0.9, 0.75, 0.65, 1.0];
const C_BLACK = [0.05, 0.05, 0.05, 1.0];

// Map 32x32
let g_map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 1],
    [1, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 2, 0, 3, 0, 2, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 3, 0, 1],
    [1, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// --- Shaders ---
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position; 
  attribute vec2 a_UV;
  
  varying vec2 v_UV;
  
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  
  void main() { 
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV; 
  }`;

var FSHADER_SOURCE = `
  precision mediump float; 
  varying vec2 v_UV;
  
  uniform vec4 u_FragColor; 
  
  // Use multiple samplers for multiple textures
  uniform sampler2D u_Sampler0; // Sky
  uniform sampler2D u_Sampler1; // Ground
  uniform sampler2D u_Sampler2; // Walls
  
  uniform int u_whichTexture; // -2: Color, -1: Debug, 0: Texture0, 1: Texture1...

  void main() { 
    if (u_whichTexture == -2) {
       gl_FragColor = u_FragColor;                    // Use color logic
    } else if (u_whichTexture == -1) {
       gl_FragColor = vec4(v_UV, 1.0, 1.0);           // Debug UV
    } else if (u_whichTexture == 0) {
       gl_FragColor = texture2D(u_Sampler0, v_UV);    // Use Sky Texture
    } else if (u_whichTexture == 1) {
       gl_FragColor = texture2D(u_Sampler1, v_UV);    // Use Ground Texture
    } else if (u_whichTexture == 2) {
       gl_FragColor = texture2D(u_Sampler2, v_UV);    // Use Wall Texture
    } else {
       gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);       // Error Red
    }
  }`;

// --- Setup ---
function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) return;
    
    // REQUIREMENT: Enable Depth Test
    gl.enable(gl.DEPTH_TEST);
}

// Global samplers
let u_Sampler0, u_Sampler1, u_Sampler2;

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) return;

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    
    // Get Locations for Samplers
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, identityM.elements);
}

function initTextures() {
    function loadTexture(imagePath, textureUnit, samplerUniform) {
         var texture = gl.createTexture();
         
         // Set a placeholder TEXTURE while loading
         // We generate a Checkerboard pattern in memory so you can see textures working
         // even if the image fails to load (e.g., due to CORS or path issues).
         gl.activeTexture(textureUnit);
         gl.bindTexture(gl.TEXTURE_2D, texture);
         
         // Create a 4x4 procedural texture
         // Level 0, internalFormat, width, height, border, format, type, data
         var myColor = [255, 255, 255];
         if (textureUnit == gl.TEXTURE0) myColor = [135, 206, 235]; // Sky
         if (textureUnit == gl.TEXTURE1) myColor = [100, 200, 100]; // Ground
         if (textureUnit == gl.TEXTURE2) myColor = [150, 150, 150]; // Wall

         // Create data for 4x4 texture (flat array)
         var data = new Uint8Array(4 * 4 * 4);
         for(var i=0; i<16; i++) {
             var isCheck = i % 2 == 0; // Simple checker
             if (Math.floor(i/4)%2==1) isCheck = !isCheck; // Stagger rows
             var offset = i * 4;
             if (isCheck) {
                // Main Color
                data[offset] = myColor[0];
                data[offset+1] = myColor[1];
                data[offset+2] = myColor[2];
                data[offset+3] = 255;
             } else {
                // Darker Shade for contrast
                data[offset] = myColor[0] * 0.5;
                data[offset+1] = myColor[1] * 0.5;
                data[offset+2] = myColor[2] * 0.5;
                data[offset+3] = 255;
             }
         }
         
         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4, 4, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
         
         // Default parameters
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
         
         var image = new Image();
         image.onload = function() {
             var unitIndex = 0;
             if (textureUnit == gl.TEXTURE1) unitIndex = 1;
             if (textureUnit == gl.TEXTURE2) unitIndex = 2;
             console.log("Image loaded: " + imagePath + " for unit " + unitIndex);

             gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
             gl.activeTexture(textureUnit);
             gl.bindTexture(gl.TEXTURE_2D, texture);
             
             // Upload the image into the texture.
             gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
             
             // Set parameters for non-power-of-2 images (or any image to be safe)
             // This prevents "black texture" if dimensions are weird.
             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
         };
         image.onerror = function() {
             console.error('Failed to load image: ' + imagePath);
         }
         image.src = imagePath; 
         
         // Bind sampler
         var unitIndex = 0;
         if (textureUnit == gl.TEXTURE1) unitIndex = 1;         
         if (textureUnit == gl.TEXTURE2) unitIndex = 2;         
         gl.uniform1i(samplerUniform, unitIndex);
         
         return texture;
    }
    
    function isPowerOf2(value) {
        return (value & (value - 1)) == 0;
    }
    
    // Load multiple textures
    // Texture 0: Sky (using sky.jpg or fallback)
    loadTexture('sky.jpg', gl.TEXTURE0, u_Sampler0);
    
    // Texture 1: Ground (using ground.jpg or fallback)
    loadTexture('ground.jpg', gl.TEXTURE1, u_Sampler1);
    
    // Texture 2: Wall (using wall.jpg or fallback)
    loadTexture('wall.jpg', gl.TEXTURE2, u_Sampler2);
}



function addBlock() {
    let result = getMapBlockInFront();
    if (result.hit) {
        // Place block adjacent to the hit face
        // We need to know which face was hit to know where to add
        // Simple logic: add at the empty space right before the hit.
        // My raycast helper returns 'previous' block coords
        let pos = result.prev;
        if (pos.x >= 0 && pos.x < 32 && pos.y >= 0 && pos.y < 32) {
             if (g_map[pos.x][pos.y] < 4) {
                 g_map[pos.x][pos.y] += 1;
             }
        }
    }
}

function removeBlock() {
    let result = getMapBlockInFront();
    if (result.hit) {
        let pos = result.curr;
        if (pos.x >= 0 && pos.x < 32 && pos.y >= 0 && pos.y < 32) {
            if (g_map[pos.x][pos.y] > 0) {
                 g_map[pos.x][pos.y] -= 1;
            }
        }
    }
}

// Raycast Logic
function getMapBlockInFront() {
    // Ray start: Camera Eye
    let ox = g_camera.eye.elements[0];
    let oy = g_camera.eye.elements[1];
    let oz = g_camera.eye.elements[2];
    
    // Ray dir: Camera Look Vector
    let dx = g_camera.at.elements[0] - ox;
    let dy = g_camera.at.elements[1] - oy;
    let dz = g_camera.at.elements[2] - oz;
    
    // Normalize
    let len = Math.sqrt(dx*dx + dy*dy + dz*dz);
    dx /= len; dy /= len; dz /= len;
    
    // Step through the ray
    let x = ox, y = oy, z = oz;
    let step = 0.1; // Small steps
    let maxDist = 8.0; // Reach distance
    
    let lastMapX = -1, lastMapY = -1;
    
    for(let d=0; d<maxDist; d+=step) {
        x += dx * step;
        y += dy * step;
        z += dz * step;
        
        // Convert world coord to map coord
        // Map is centered: 16,16 is at world 0,0?. 
        // drawMap: translate(x-16, h-0.75, y-16)
        // World X = MapX - 16; => MapX = WorldX + 16
        // World Y = h - 0.75;  => h = WorldY + 0.75
        // World Z = MapY - 16; => MapY = WorldZ + 16
        
        let mapX = Math.round(x + 16);
        let mapZ = Math.round(z + 16);
        
        if (mapX >= 0 && mapX < 32 && mapZ >= 0 && mapZ < 32) {
            // Check wall height at this location
            let wallHeight = g_map[mapX][mapZ];
            // If wallHeight is 0, floor is at y=-0.75?
            // Actually walls are cubes.
            // h loops 0 to height. translate y = h - 0.75
            // So blocks are at y = -0.75, 0.25, 1.25...
            // Each block is 1x1x1 (scaled?) No, default cube is 1x1x1.
            // Let's assume block fills y range [h-1.25, h-0.25]?
            // Cube defined -0.5 to 0.5? No, 0 to 1 usually in my definition or centered?
            // "drawMap... wall.matrix.translate(x-16, h-0.75, y-16)"
            // Cube() default is 0..1 in x,y,z? No, let's check Cube definition.
            // Oh, cube vertices in cube.js are 0..1. 
            // So wall at h=0 is at y = -0.75 to +0.25.
            
            // Check if ray Y is within any block height
            // We just need to hit A block. 
            // The highest block is at index wallHeight-1.
            // Its range is y_min = (wallHeight-1) - 0.75
            //              y_max = y_min + 1.0
            
            // Actually easier: Check if current ray point (x,y,z) is inside any block.
            // Since we iterate mapX, mapY, we just check if y < wallHeight - 0.75 + 1.0?
            // Floor is at -0.75.
            // Map floor check?
            
            // Simple bound check:
            // Is y > -0.75 (ground) and y < wallHeight - 0.75?
            // Actually, let's just check if we hit a voxel.
            // Voxel exists if y_coord corresponds to an index < wallHeight.
            // index = floor(y + 0.75).
            // If 0 <= index < wallHeight, we hit a block!
            
            let hIndex = Math.floor(y + 0.75);
            if (hIndex >= 0 && hIndex < wallHeight) {
                return {
                    hit: true,
                    curr: {x: mapX, y: mapZ, h: hIndex},
                    prev: {x: lastMapX, y: lastMapY} // Approximate "face" logic
                };
            }
        }
        lastMapX = Math.round(x + 16);
        lastMapY = Math.round(z + 16);
    }
    return {hit: false};
}


function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionForHtmlUI();
    
    g_camera = new Camera();
    
    // Controls:
    document.onkeydown = keydown;
    
    initTextures();
    
    gl.clearColor(0.1, 0.1, 0.15, 1.0); 
    requestAnimationFrame(tick);
}

function keydown(ev) {
    if (ev.key == 'w') { g_camera.moveForward(); }
    else if (ev.key == 's') { g_camera.moveBackwards(); }
    else if (ev.key == 'a') { g_camera.moveLeft(); }
    else if (ev.key == 'd') { g_camera.moveRight(); }
    else if (ev.key == 'q') { g_camera.panLeft(); }
    else if (ev.key == 'e') { g_camera.panRight(); }
    
    renderScene(); // Re-render on key press for immediate feedback
}
// ... keep updateAnimationAngles ...


// Performance tracking variables
var g_frameCount = 0;
var g_lastFPSUpdate = 0;
var g_fps = 0;

// REQUIREMENT: Tick function with FPS counter
function tick() {
    g_seconds = (performance.now() - g_startTime) / 1000.0;
    
    // Calculate FPS
    g_frameCount++;
    if (g_seconds - g_lastFPSUpdate >= 1.0) {
        g_fps = g_frameCount / (g_seconds - g_lastFPSUpdate);
        g_frameCount = 0;
        g_lastFPSUpdate = g_seconds;
        
        // Update FPS display
        var fpsDisplay = document.getElementById('fpsDisplay');
        fpsDisplay.textContent = 'FPS: ' + g_fps.toFixed(1);
        
        // Color code based on performance
        fpsDisplay.className = 'fps-display';
        if (g_fps < 10) {
            fpsDisplay.classList.add('bad');
        } else if (g_fps < 30) {
            fpsDisplay.classList.add('slow');
        }
    }
    
    updateAnimationAngles();
    updateSnow();
    renderScene();
    requestAnimationFrame(tick);
}

// REQUIREMENT: Update Animation logic separate from render
function updateAnimationAngles() {
    // Handle Swing Animation (Manual override)
    if (g_swingAnimation) {
        var t = (g_seconds - g_swingStartTime) / 0.5; // 0.5s duration
        if (t > 1) {
            g_swingAnimation = false;
        } else {
             g_rightArmAngle = -60 * Math.sin(t * Math.PI);
        }
        return; 
    }

    // Handle poke animation (staff to/from ear)
    if (g_pokeAnimation) {
        var elapsed = g_seconds - g_pokeStartTime;
        g_pokeProgress = Math.min(elapsed / POKE_DURATION, 1.0);
        
        // Smooth easing
        var t = g_pokeProgress;
        var eased = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2;
        
        if (g_staffHidden) {
            // Retrieving staff from ear - reverse animation
            eased = 1 - eased;
        }
        
        // Animate right arm raising to ear
        g_rightArmAngle = eased * -160;  // Raise arm up and back toward head
        g_rightForearmAngle = eased * 120; // Bend elbow to reach ear
        
        // Check if animation complete
        if (g_pokeProgress >= 1.0) {
            g_pokeAnimation = false;
            if (!g_staffHidden) {
                // Just finished storing staff
                g_staffHidden = true;
            } else {
                // Just finished retrieving staff
                g_staffHidden = false;
            }
        }
        return; // Skip normal animation during poke
    }
    
    // Default Animation State (Idle / Training)
    if (g_animationOn) {
        let sway = Math.sin(g_seconds * 2);

        // -- Legs & Body --
        g_leftLegAngle = sway * 2;
        
        // -- Left Arm --
        g_leftArmAngle = -5 + sway * 5;
        
        // -- Right Arm Configuration --
        if (g_staffHidden) {
             // Idle with Empty Hand
             g_rightArmAngle = 5 + sway * 5;
             g_rightForearmAngle = 0;
             g_staffOffset = sway * 5;
             g_treeShake = 0;
        } else {
             // Training Mode: Automatic Swing at Tree (Improved)
             // Cycle: 2 seconds
             var cycle = g_seconds % 2.0; 
             
             // Phase 1: Windup (0.0 - 0.5)
             if (cycle < 0.5) {
                 // Raise arm high and back
                 // Interpolate from 5 to -130
                 var progress = cycle / 0.5;
                 g_rightArmAngle = 5 * (1-progress) + (-130) * progress;
                 g_rightForearmAngle = -30 * progress;
                 g_treeShake = 0;
             } 
             // Phase 2: SMASH (0.5 - 0.7)
             else if (cycle < 0.7) {
                 // Fast swing DOWN
                 // Interpolate -130 to -10
                 var progress = (cycle - 0.5) / 0.2; // 0 to 1
                 // Easing for impact "snap"
                 progress = Math.pow(progress, 0.5); 
                 
                 g_rightArmAngle = -130 * (1-progress) + (-10) * progress;
                 g_rightForearmAngle = -30 * (1-progress); // Straighten arm
                 g_treeShake = 0;
             }
             // Phase 3: Impact/Shake (0.7 - 1.0)
             else if (cycle < 1.0) {
                 // Hold position against tree
                 g_rightArmAngle = -10;
                 // SHAKE THE TREE!
                 g_treeShake = Math.sin(g_seconds * 40) * 5; // Fast shake
             }
             // Phase 4: Recover (1.0 - 2.0)
             else {
                 g_treeShake = 0;
                 // Return to idle
                 var progress = (cycle - 1.0) / 1.0;
                 g_rightArmAngle = -10 * (1-progress) + 5 * progress;
             }
        }
    }
}

// REQUIREMENT: Render Scene function
function renderScene() {
    // REQUIREMENT: Clear Color AND Depth Buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Pass the projection matrix
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);

    // Pass the view matrix
    gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);

    // Pass the global rotation matrix (kept for Wukong or specific objects if needed, but World is Camera based)
    var globalRotMat = new Matrix4();
    globalRotMat.rotate(g_globalAngle, 0, 1, 0); // Preserved for Wukong rotation if desired?
    // Actually, let's keep GlobalRotateMatrix identity for the world.
    // If we want to rotate Wukong, we rotate his Model Matrix.
    // But the assignment "Camera can be rotated with the mouse" implies Camera Pan.
    // So I will set u_GlobalRotateMatrix to Identity for the world geometry.
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityM.elements);

    // --- Draw World ---
    drawSky();
    drawGround();
    drawMap();

    // --- Draw Wukong ---
    // We treat Wukong as an object in the world at (0,0,0) or nearby.
    // We can apply a specific model transform for him.
    var wukongBaseMatrix = new Matrix4();
    wukongBaseMatrix.translate(0, -0.5, -3); // Place him in front of start
    
    // Rotate to face the tree (Tree is at x=1.4)
    // Previously -90 (facing -X). Now 90 (facing +X)
    wukongBaseMatrix.rotate(90, 0, 1, 0); 
    
    wukongBaseMatrix.scale(2, 2, 2); // Make him visible
    // Maybe rotate him
    wukongBaseMatrix.rotate(g_globalAngle, 0, 1, 0);

    drawWukong(wukongBaseMatrix);
    
    drawTree(); // Add simple story element
    drawSnow();
}

function updateSnow() {
    if (!g_snowEnabled) return; // Stop updating if disabled

    // 1. Spawn new snow (with recycling)
    let particlesToSpawn = 3;
    
    // Fill empty slots (new particles)
    if (g_snowParticles.length < MAX_SNOW) {
        for(let i = 0; i < particlesToSpawn; i++) {
             g_snowParticles.push({
                 x: (Math.random() - 0.5) * 32, 
                 y: 15 + Math.random() * 5,     
                 z: (Math.random() - 0.5) * 32, 
                 active: true
             });
        }
    } else {
        // Recycle inactive particles to keep raining
        let respawnCount = 0;
        let startIdx = Math.floor(Math.random() * g_snowParticles.length);
        for(let k = 0; k < g_snowParticles.length && respawnCount < particlesToSpawn; k++) {
             let i = (startIdx + k) % g_snowParticles.length;
             if (!g_snowParticles[i].active) {
                // Respawn this landed particle at the top
                g_snowParticles[i].x = (Math.random() - 0.5) * 32;
                g_snowParticles[i].y = 15 + Math.random() * 5;
                g_snowParticles[i].z = (Math.random() - 0.5) * 32;
                g_snowParticles[i].active = true;
                respawnCount++;
             }
        }
    }

    // 2. Update existing
    for (let i = 0; i < g_snowParticles.length; i++) {
        let s = g_snowParticles[i];
        if (!s.active) continue; // It's landed

        s.y -= 0.1; // Fall speed

        // Check ground collision
        let groundLevel = -0.75; // Base floor

        // Check Map Collision
        // Map indices from (x, z)
        let mx = Math.round(s.x + 16);
        let my = Math.round(s.z + 16);
        
        if (mx >= 0 && mx < 32 && my >= 0 && my < 32) {
             let h = g_map[mx][my];
             // If there's a block stack, the top is at (h - 0.75) + 1.0? 
             // No, standard draw logic:
             // translate(x, h-0.75, z). 
             // Box top is at (h-0.75) + 1 = h + 0.25 (since cube is 1 unit, vertices 0 to 1).
             // Actually local coords 0 to 1. Translate puts 0 at h-0.75. So top is at h + 0.25.
             // Wait, h iterates 0 to height-1.
             // Top block is h = height-1.
             // Top face Y = (height-1 - 0.75) + 1 = height - 0.75.
             if (h > 0) {
                 groundLevel = h - 0.75;
             }
        }

        if (s.y <= groundLevel) {
            s.y = groundLevel; // Stick to top
            s.active = false;  // Stop moving
        }
    }
    
    // Cleanup if too far down (optional, but protects against bugs)
    // g_snowParticles = g_snowParticles.filter(s => s.y > -5);
}

function drawSnow() {
    if (!g_snowCube) {
         g_snowCube = new Cube();
         g_snowCube.color = [1, 1, 1, 1]; // White snow
         g_snowCube.textureNum = -2;      // Use Color
    }
    
    // Draw all particles
    for(let i = 0; i < g_snowParticles.length; i++) {
        let s = g_snowParticles[i];
        
        // Re-use the single cube matrix for performance
        g_snowCube.matrix.setTranslate(s.x, s.y, s.z);
        g_snowCube.matrix.scale(0.1, 0.1, 0.1); // Small flake
        
        g_snowCube.renderFast();
    }
}

function drawCube(matrix, color) {
    var c = new Cube();
    c.color = color;
    c.matrix = matrix;
    c.render();
}

function drawSphere(matrix, color) { drawCube(matrix, color); }
function drawCylinder(matrix, color) { drawCube(matrix, color); }

function drawTree() {
   // A simple tree for Wukong to "hit"
   
   // Apply Shake if active
   var shakeMat = new Matrix4();
   if (g_treeShake !== 0) {
       shakeMat.rotate(g_treeShake, 0, 0, 1); // Z-axis shake
   }
   
   // Trunk
   var trunk = new Cube();
   trunk.color = [0.55, 0.27, 0.07, 1.0]; // Brown
   trunk.textureNum = -2; // Use Color
   trunk.matrix.translate(1.4, -0.75, -3.0); 
   trunk.matrix.multiply(shakeMat); // Apply shake
   trunk.matrix.scale(0.5, 2.0, 0.5);
   trunk.render();
   
   // Leaves
   var leaves = new Cube();
   leaves.color = [0.0, 0.8, 0.0, 1.0]; // Green
   leaves.textureNum = -2;
   leaves.matrix.translate(1.0, 0.8, -3.5); 
   
   leaves.matrix.translate(0.4, -1.55, 0.5); // Undo translate 
   leaves.matrix.multiply(shakeMat);         // Shake around base
   leaves.matrix.translate(-0.4, 1.55, -0.5); // Redo translate
   
   leaves.matrix.scale(1.5, 1.5, 1.5);
   leaves.render();
}

function drawSky() {
    var sky = new Cube();
    sky.color = [0.5, 0.7, 1.0, 1.0]; // Blue Sky Color
    sky.textureNum = 0; // Use Sky Texture (Unit 0)
    if (typeof u_whichTexture !== 'undefined') {
       // sky.textureNum = 0; 
    }
    
    sky.matrix.scale(50, 50, 50);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.render();
}

function drawGround() {
    var ground = new Cube();
    ground.color = [0.4, 0.8, 0.4, 1.0]; // Green Ground Color
    ground.textureNum = 1; // Use Ground Texture (Unit 1)
    
    ground.matrix.translate(0, -0.75, 0);
    ground.matrix.scale(32, 0, 32);
    ground.matrix.translate(-0.5, 0, -0.5);
    ground.render();
}

function drawMap() {
    // Walls
    // Loop through g_map
    for (var x = 0; x < 32; x++) {
        for (var y = 0; y < 32; y++) {
            var height = g_map[x][y];
            if (height > 0) {
                 for (var h = 0; h < height; h++) {
                     var wall = new Cube();
                     wall.textureNum = 2; // Use Wall Texture (Unit 2)
                     wall.color = [1.0, 1.0, 1.0, 1.0]; // White base for texture
                     
                     wall.matrix.translate(x - 16, h - 0.75, y - 16);
                     wall.render();
                 }
            }
        }
    }
}

function drawWukong(baseMatrix) {
    // ================= SUN WUKONG MODEL =================
    // Modified to take a base matrix for placement
    
    // --- TORSO (Root) ---
    var bodyMat = new Matrix4(baseMatrix);
    bodyMat.translate(-0.15, -0.2, 0.0);
    var bodyCoord = new Matrix4(bodyMat); // Save for limbs
    
    // Main Armor Plate (Dark)
    bodyMat.scale(0.3, 0.45, 0.2);
    drawCube(bodyMat, C_DARK);

    // Chest Gold Plate (Detail)
    var chestMat = new Matrix4(bodyCoord);
    chestMat.translate(0.025, 0.2, -0.01); 
    chestMat.scale(0.25, 0.2, 0.05);
    drawCube(chestMat, C_GOLD);

    // Sash/Belt (Red)
    var beltMat = new Matrix4(bodyCoord);
    beltMat.translate(-0.01, 0.0, -0.01);
    beltMat.scale(0.32, 0.08, 0.22);
    drawCube(beltMat, C_RED);

    // --- HEAD ---
    var headMat = new Matrix4(bodyCoord);
    
    // Fix Head Pivot for 180 Degree Rotation
    // Original: (0.05, 0.45, 0.0) -> Extends +X (0.2), +Z (0.2)
    // Rotated 180: Pivot is origin. Extends -X, -Z.
    // To maintain alignment with Body Center (X=0.15, Z=0.1), we shift pivot to opposite corner.
    // New Pivot: X = 0.05 + 0.2 = 0.25
    //            Z = 0.0 + 0.2 = 0.2
    
    headMat.translate(0.25, 0.45, 0.2); 
    
    // Fix Head Orientation (User Requested 180 flip)
    headMat.rotate(180, 0, 1, 0);
    
    // Head bob animation
    if(g_animationOn) headMat.rotate(Math.sin(g_seconds*3)*5, 1, 0, 0);
    var headCoord = new Matrix4(headMat); // Save head coord

    // Head Base (Fur)
    headMat.scale(0.2, 0.22, 0.2);
    drawCube(headMat, C_FUR);

    // Face (Skin) - larger for monkey face
    var faceMat = new Matrix4(headCoord);
    faceMat.translate(0.03, 0.03, -0.03);
    faceMat.scale(0.14, 0.14, 0.05);
    drawCube(faceMat, C_SKIN);

    // Snout/Muzzle (protruding monkey snout)
    var snoutMat = new Matrix4(headCoord);
    snoutMat.translate(0.05, 0.02, -0.05);
    snoutMat.scale(0.1, 0.08, 0.05);
    drawCube(snoutMat, C_SKIN);

    // Left Eye
    var lEyeMat = new Matrix4(headCoord);
    lEyeMat.translate(0.03, 0.12, -0.035);
    lEyeMat.scale(0.04, 0.04, 0.02);
    drawCube(lEyeMat, C_BLACK);

    // Right Eye
    var rEyeMat = new Matrix4(headCoord);
    rEyeMat.translate(0.13, 0.12, -0.035);
    rEyeMat.scale(0.04, 0.04, 0.02);
    drawCube(rEyeMat, C_BLACK);

    // Eye whites (behind black pupils)
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

    // Mouth line
    var mouthMat = new Matrix4(headCoord);
    mouthMat.translate(0.06, 0.01, -0.06);
    mouthMat.scale(0.08, 0.015, 0.02);
    drawCube(mouthMat, [0.3, 0.15, 0.1, 1.0]);

    // Fur around face (beard/cheeks)
    var lCheekMat = new Matrix4(headCoord);
    lCheekMat.translate(-0.01, 0.02, -0.01);
    lCheekMat.scale(0.05, 0.12, 0.08);
    drawCube(lCheekMat, C_FUR);

    var rCheekMat = new Matrix4(headCoord);
    rCheekMat.translate(0.16, 0.02, -0.01);
    rCheekMat.scale(0.05, 0.12, 0.08);
    drawCube(rCheekMat, C_FUR);

    // Golden Circlet (Crown)
    var crownMat = new Matrix4(headCoord);
    crownMat.translate(-0.01, 0.18, -0.01);
    crownMat.scale(0.22, 0.04, 0.22);
    drawCube(crownMat, C_GOLD);


    // FEATHERS (Curved) - built from multiple cube segments for performance
    // Left Feather - curves outward to the left
    var lFeatherBase = new Matrix4(headCoord);
    lFeatherBase.translate(0.05, 0.22, 0.08);
    if(g_animationOn) lFeatherBase.rotate(Math.sin(g_seconds*4)*10, 1, 0, 0);
    lFeatherBase.rotate(-15, 0, 0, 1);
    lFeatherBase.rotate(-20, 1, 0, 0);
    
    // Draw curved feather with fewer cube segments (faster than cylinders)
    var numSegments = 5;
    var segmentLength = 0.15;
    var lFeatherCoord = new Matrix4(lFeatherBase);
    
    for (var i = 0; i < numSegments; i++) {
        var lSeg = new Matrix4(lFeatherCoord);
        var taper = 1.0 - (i / numSegments) * 0.7;
        lSeg.scale(0.02 * taper, segmentLength, 0.01 * taper);
        var colorFade = 1.0 - (i / numSegments) * 0.3;
        drawCube(lSeg, [0.8 * colorFade, 0.1 * colorFade, 0.1 * colorFade, 1.0]);
        
        lFeatherCoord.translate(0.0, segmentLength, 0.0);
        var curveAmount = 4 + i * 4;
        lFeatherCoord.rotate(-curveAmount, 0, 0, 1);
        lFeatherCoord.rotate(3, 1, 0, 0);
    }

    // Right Feather - curves outward to the right
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
        var curveAmount = 4 + i * 4;
        rFeatherCoord.rotate(curveAmount, 0, 0, 1);
        rFeatherCoord.rotate(3, 1, 0, 0);
    }

    // --- RIGHT ARM (Holding Staff) ---
    var rArmMat = new Matrix4(bodyCoord);
    rArmMat.translate(0.3, 0.35, 0.1); // Shoulder pos
    rArmMat.rotate(g_rightArmAngle, 1, 0, 0); // X-axis rotation (forward/backward swing)
    var rArmCoord = new Matrix4(rArmMat);

    // Shoulder Pauldron (Gold Armor) - sphere
    var rPauldron = new Matrix4(rArmCoord);
    rPauldron.translate(-0.08, -0.08, -0.08);
    rPauldron.scale(0.16, 0.16, 0.16);
    drawSphere(rPauldron, C_GOLD, 6, 8);

    // Upper Arm (Dark) - cylinder
    var rUpperArm = new Matrix4(rArmCoord);
    rUpperArm.translate(0.0, -0.2, 0.0);
    rUpperArm.scale(0.08, 0.2, 0.08);
    drawCylinder(rUpperArm, C_DARK, 10);

    // Forearm
    var rForeMat = new Matrix4(rArmCoord);
    rForeMat.translate(0.0, -0.2, 0.0); // Elbow
    rForeMat.rotate(g_rightForearmAngle - 45, 1, 0, 0); // Bent arm for holding staff
    var rForeCoord = new Matrix4(rForeMat);
    
    // Forearm cylinder
    var rForearmDraw = new Matrix4(rForeCoord);
    rForearmDraw.translate(0.0, -0.2, 0.0);
    rForearmDraw.scale(0.07, 0.2, 0.07);
    drawCylinder(rForearmDraw, C_DARK, 10);

    // Hand (Skin) - sphere at end of forearm
    var rHandMat = new Matrix4(rForeCoord);
    rHandMat.translate(-0.04, -0.32, -0.04);
    var rHandCoord = new Matrix4(rHandMat);
    rHandMat.scale(0.1, 0.1, 0.1);
    drawSphere(rHandMat, C_SKIN, 6, 8);

    // THE STAFF (Ruyi Jingu Bang) - Child of Right Hand
    // Only draw if not hidden in ear
    if (!g_staffHidden || g_pokeAnimation) {
        var staffMat = new Matrix4(rHandCoord);
        staffMat.translate(0.05, 0.05, 0.05); // Center in hand
        // STRAIGHT Orientation for smashing
        // Remove offset and weird rotations
        staffMat.rotate(90, 1, 0, 0); 
        // This should align it with the Z-axis of the hand (pointing out?)
        // Let's adjust slightly so it looks held properly
        
        staffMat.translate(0.0, -0.7, 0.0); // Center long pole
        
        // Calculate staff scale based on poke animation
        var staffScale = 1.0;
        if (g_pokeAnimation) {
            var t = g_pokeProgress;
            var eased = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2;
            if (g_staffHidden) {
                // Retrieving - staff grows
                staffScale = eased;
            } else {
                // Storing - staff shrinks
                staffScale = 1.0 - eased * 0.95; // Shrink to 5%
            }
        }
        
        // Staff Handle (Black) - cylinder
        var staffHandle = new Matrix4(staffMat);
        staffHandle.scale(0.03 * staffScale, 1.4 * staffScale, 0.03 * staffScale);
        drawCylinder(staffHandle, C_BLACK, 12);

        // Staff Gold Tips - cylinders
        var tip1 = new Matrix4(staffMat);
        tip1.translate(0.0, 1.3 * staffScale, 0.0);
        tip1.scale(0.05 * staffScale, 0.2 * staffScale, 0.05 * staffScale);
        drawCylinder(tip1, C_GOLD, 12);

        var tip2 = new Matrix4(staffMat);
        tip2.translate(0.0, -0.1 * staffScale, 0.0);
        tip2.scale(0.05 * staffScale, 0.2 * staffScale, 0.05 * staffScale);
        drawCylinder(tip2, C_GOLD, 12);
    }
    
    // Draw tiny staff in ear when hidden
    if (g_staffHidden && !g_pokeAnimation) {
        var earStaff = new Matrix4(headCoord);
        earStaff.translate(0.18, 0.1, 0.08); // Right ear position
        earStaff.rotate(90, 0, 0, 1);
        earStaff.scale(0.008, 0.05, 0.008);
        drawCylinder(earStaff, C_GOLD, 8);
    }


    // --- LEFT ARM (Standard) ---
    var lArmMat = new Matrix4(bodyCoord);
    lArmMat.translate(-0.02, 0.35, 0.1); // Attach at left side of body
    lArmMat.rotate(g_leftArmAngle, 1, 0, 0); // X-axis rotation (forward/backward swing)
    var lArmCoord = new Matrix4(lArmMat);

    // Shoulder Pauldron - sphere
    var lPauldron = new Matrix4(lArmCoord);
    lPauldron.translate(-0.1, -0.08, -0.08);
    lPauldron.scale(0.16, 0.16, 0.16);
    drawSphere(lPauldron, C_GOLD, 6, 8);

    // Upper Arm - cylinder
    var lUpperArm = new Matrix4(lArmCoord);
    lUpperArm.translate(-0.08, -0.25, 0.0);
    lUpperArm.scale(0.08, 0.25, 0.08);
    drawCylinder(lUpperArm, C_DARK, 10);

    // Forearm (child of upper arm)
    var lForeMat = new Matrix4(lArmCoord);
    lForeMat.translate(-0.08, -0.25, 0.0); // Elbow position
    lForeMat.rotate(-20, 1, 0, 0); // Slight bend
    var lForeCoord = new Matrix4(lForeMat);
    
    // Forearm cylinder
    var lForearmDraw = new Matrix4(lForeCoord);
    lForearmDraw.translate(0.0, -0.2, 0.0);
    lForearmDraw.scale(0.07, 0.2, 0.07);
    drawCylinder(lForearmDraw, C_DARK, 10);

    // Left Hand (child of forearm) - sphere
    var lHandMat = new Matrix4(lForeCoord);
    lHandMat.translate(-0.04, -0.44, -0.02);
    lHandMat.scale(0.1, 0.1, 0.1);
    drawSphere(lHandMat, C_SKIN, 6, 8);


    // --- LEGS (Thigh -> Shin -> Foot) ---
    
    // Left Leg (Deep hierarchy example)
    var lThighMat = new Matrix4(bodyCoord);
    lThighMat.translate(0.04, 0.0, 0.1); // Hip joint - centered under body
    lThighMat.rotate(g_leftLegAngle, 1, 0, 0); // Thigh swing (forward/backward)
    var lThighCoord = new Matrix4(lThighMat); // Save thigh frame
    
    // Thigh (Red Pants) - cylinder
    var lThighDraw = new Matrix4(lThighCoord);
    lThighDraw.translate(0.0, -0.25, 0.0);
    lThighDraw.scale(0.1, 0.25, 0.1);
    drawCylinder(lThighDraw, C_RED, 10);

    // Shin (Child of Thigh)
    var lShinMat = new Matrix4(lThighCoord);
    lShinMat.translate(0.0, -0.25, 0.0); // Knee position
    lShinMat.rotate(g_leftShinAngle, 1, 0, 0); // Knee bend
    var lShinCoord = new Matrix4(lShinMat); // Save shin frame
    
    // Greaves (Gold Armor) - cylinder
    var lShinDraw = new Matrix4(lShinCoord);
    lShinDraw.translate(0.0, -0.25, 0.0);
    lShinDraw.scale(0.09, 0.25, 0.09);
    drawCylinder(lShinDraw, C_GOLD, 10);

    // Foot (Child of Shin)
    var lFootMat = new Matrix4(lShinCoord);
    lFootMat.translate(0.0, -0.25, 0.0); // Ankle position (aligned with end of shin)
    lFootMat.rotate(g_leftFootAngle, 1, 0, 0); // Ankle bend
    lFootMat.translate(-0.045, 0, 0); // Center foot horizontally
    lFootMat.scale(0.09, 0.05, 0.15);
    lFootMat.translate(0, 0, -0.5); // Extend foot forward (toward face)
    drawCube(lFootMat, C_BLACK);

    // Right Leg (Static for stability in this pose)
    var rThighMat = new Matrix4(bodyCoord);
    rThighMat.translate(0.2, 0.0, 0.1); // Hip joint - right side
    var rThighCoord = new Matrix4(rThighMat);
    
    // Thigh - cylinder
    var rThighDraw = new Matrix4(rThighCoord);
    rThighDraw.translate(0.0, -0.25, 0.0);
    rThighDraw.scale(0.1, 0.25, 0.1);
    drawCylinder(rThighDraw, C_RED, 10);

    // Shin - cylinder
    var rShinMat = new Matrix4(rThighCoord);
    rShinMat.translate(0.0, -0.25, 0.0); // Knee position
    var rShinCoord = new Matrix4(rShinMat); // Save shin frame
    
    var rShinDraw = new Matrix4(rShinCoord);
    rShinDraw.translate(0.0, -0.25, 0.0);
    rShinDraw.scale(0.09, 0.25, 0.09);
    drawCylinder(rShinDraw, C_GOLD, 10);

    // Foot - positioned below shin (Child of Shin)
    var rFootMat = new Matrix4(rShinCoord);
    rFootMat.translate(0.0, -0.25, 0.0); // Ankle position (aligned with end of shin)
    rFootMat.translate(-0.045, 0, 0); // Center foot horizontally
    rFootMat.scale(0.09, 0.05, 0.15);
    rFootMat.translate(0, 0, -0.5); // Extend foot forward (toward face)
    drawCube(rFootMat, C_BLACK);
}

// --- UI Actions ---
function addActionForHtmlUI(){
    // Background Music fix (Browser Autoplay Policy)
    document.body.addEventListener('click', function() {
        var audio = document.getElementById('bgm');
        if (audio && audio.paused) {
            audio.play().catch(e => console.log("Audio play failed: ", e));
        }
    }, { once: true }); // Only try once per session

    // Animation Toggle
    document.getElementById('animationOnButton').onclick = function() { g_animationOn = true; this.classList.add('active'); document.getElementById('animationOffButton').classList.remove('active'); };
    document.getElementById('animationOffButton').onclick = function() { g_animationOn = false; this.classList.add('active'); document.getElementById('animationOnButton').classList.remove('active'); };

    // Snow Toggle
    document.getElementById('snowButton').onclick = function() { 
        g_snowEnabled = !g_snowEnabled; 
        if(g_snowEnabled) {
             this.classList.add('active');
             this.innerText = "Snow ON";
        } else {
             this.classList.remove('active');
             this.innerText = "Snow OFF";
        }
    };

    // Update Mouse Control for Camera Pan
    var isDragging = false;
    var lastMouseX = 0;
    
    // Add Click Handler for Minecraft Logic (Add/Remove Block)
    canvas.onmousedown = function(ev) {
        if (ev.shiftKey) { 
             if (g_staffHidden) {
                 if (!g_pokeAnimation) {
                    g_pokeAnimation = true;
                    g_pokeStartTime = g_seconds;
                    g_pokeProgress = 0;
                }
             } else {
                 if (!g_swingAnimation) {
                     g_swingAnimation = true;
                     g_swingStartTime = g_seconds;
                     console.log("Swing!");
                 }
             }
            return;
        }
        
        // Minecraft Logic: Right click (button 2) to remove, Left click with Ctrl to add? 
        // Or just normal clicks but distinguish from drag.
        // Let's implement simple check: if mouse moves significantly, it's drag.
        
        // For simplicity:
        // Left Click + Ctrl = Add Block
        // Left Click + Alt = Remove Block
        // Just Drag = Rotate
        
        if (ev.ctrlKey) {
            addBlock();
            renderScene();
            return;
        }
        if (ev.altKey) {
            removeBlock(); // or shift+click on mac might be right click?
            renderScene();
            return;
        }
        
        // Otherwise start drag
        isDragging = true;
        lastMouseX = ev.clientX;
    };
    
    // Also listen for key presses for block manipulation for easier testing
    document.addEventListener('keydown', function(ev) {
        if (ev.code === 'KeyZ') { // Z to remove
             removeBlock();
             renderScene();
        }
        if (ev.code === 'KeyX') { // X to add
             addBlock();
             renderScene();
        }
    });
    
    canvas.onmouseup = function(ev) { isDragging = false; };
    canvas.onmouseleave = function(ev) { isDragging = false; };
    
    canvas.onmousemove = function(ev) {
        if (isDragging) {
            var deltaX = ev.clientX - lastMouseX;
            // Map Mouse X to Camera Pan
            // Sensitivity
            if (deltaX !== 0) {
                 // Rotate more proportional to movement. 
                 // Previous implementation called panLeft/Right which did incremental steps.
                 // Better to calculate angle based on deltaX.
                 var rotationSpeed = 0.2; // Degrees per pixel
                 g_camera.panLeft(-deltaX * rotationSpeed); // panLeft handles rotation matrix
            }
            lastMouseX = ev.clientX;
        }
    };

    // Keep slider listeners but update what they do or remove them if not needed.
    // For now, let g_globalAngle control Wukong's Y rotation or just be unused for camera.
    document.getElementById('angleSlider').addEventListener('input', function() { 
        g_globalAngle = parseFloat(this.value); 
        document.getElementById('angleValue').textContent = this.value;
        // renderScene(); 
    });
    
    // Joints...
    document.getElementById('rightArmSlider').addEventListener('input', function() { g_rightArmAngle = parseFloat(this.value); });
    document.getElementById('rightForearmSlider').addEventListener('input', function() { g_rightForearmAngle = parseFloat(this.value); });
    document.getElementById('leftArmSlider').addEventListener('input', function() { g_leftArmAngle = parseFloat(this.value); });
    document.getElementById('leftLegSlider').addEventListener('input', function() { g_leftLegAngle = parseFloat(this.value); });
    document.getElementById('leftShinSlider').addEventListener('input', function() { g_leftShinAngle = parseFloat(this.value); });
    document.getElementById('leftFootSlider').addEventListener('input', function() { g_leftFootAngle = parseFloat(this.value); });
}
    
