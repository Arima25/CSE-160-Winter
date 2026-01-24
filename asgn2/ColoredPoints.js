// --- Global Variables ---
let canvas, gl, a_Position, u_FragColor, u_PointSize, u_ModelMatrix;
let u_GlobalRotateMatrix; 
let g_globalAngle = 0;    // Y-axis rotation (horizontal mouse / slider)
let g_globalAngleX = 0;   // X-axis rotation (vertical mouse)

// Joint angles
let g_rightArmAngle = 0;
let g_rightForearmAngle = 0;
let g_leftArmAngle = 0;
let g_leftLegAngle = 0;
let g_leftShinAngle = 0;
let g_leftFootAngle = 0;
let g_staffOffset = 0; // New slider for staff

// Animation
let g_animationOn = true;
let g_seconds = 0;
let g_startTime = performance.now();

// Poke Animation (Staff to Ear)
let g_pokeAnimation = false;      // Is poke animation playing?
let g_staffHidden = false;        // Is staff currently hidden in ear?
let g_pokeProgress = 0;           // Animation progress 0 to 1
let g_pokeStartTime = 0;          // When poke started
const POKE_DURATION = 1.5;        // Animation duration in seconds

// Wukong Colors
const C_GOLD = [1.0, 0.85, 0.0, 1.0];        // Armor trim / Staff ends
const C_RED = [0.8, 0.1, 0.1, 1.0];          // Pants / Sash / Feathers
const C_DARK = [0.2, 0.2, 0.25, 1.0];        // Chainmail / Armor base
const C_FUR = [0.65, 0.45, 0.25, 1.0];       // Monkey Fur
const C_SKIN = [0.9, 0.75, 0.65, 1.0];       // Face / Hands
const C_BLACK = [0.05, 0.05, 0.05, 1.0];     // Staff handle / Shoes

// --- Shaders ---
var VSHADER_SOURCE = `
  attribute vec4 a_Position; 
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() { 
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position; 
  }`;

var FSHADER_SOURCE = `
  precision mediump float; 
  uniform vec4 u_FragColor; 
  void main() { 
    gl_FragColor = u_FragColor; 
  }`;

// --- Setup ---
function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) return;
    
    // REQUIREMENT: Enable Depth Test
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) return;

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionForHtmlUI();
    
    gl.clearColor(0.1, 0.1, 0.15, 1.0); // Dark background for contrast
    requestAnimationFrame(tick);
}

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
    renderScene();
    requestAnimationFrame(tick);
}

// REQUIREMENT: Update Animation logic separate from render
function updateAnimationAngles() {
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
    
    // Keep arm position if staff is hidden
    if (g_staffHidden) {
        g_rightArmAngle = 0;
        g_rightForearmAngle = 0;
        return;
    }
    
    if (g_animationOn) {
        // Idle breathing stance
        let sway = Math.sin(g_seconds * 2);
        
        // Arms sway slightly
        g_rightArmAngle = 5 + sway * 5; 
        g_leftArmAngle = -5 + sway * 5;
        
        // Staff bobs up and down with the arm
        g_staffOffset = sway * 5;

        // Legs adjust balance
        g_leftLegAngle = sway * 2;
        
        // Complex animation: Head feathers sway (simulated in render with time)
    }
}

// REQUIREMENT: Render Scene function
function renderScene() {
    // REQUIREMENT: Clear Color AND Depth Buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Apply both X and Y axis rotations for mouse control
    var globalRotMat = new Matrix4();
    globalRotMat.rotate(g_globalAngleX, 1, 0, 0);  // X-axis rotation (up/down mouse)
    globalRotMat.rotate(g_globalAngle, 0, 1, 0);   // Y-axis rotation (left/right mouse)
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // ================= SUN WUKONG MODEL =================

    // --- TORSO (Root) ---
    var bodyMat = new Matrix4();
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
    headMat.translate(0.05, 0.45, 0.0); // Neck position - centered on body Z
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
        staffMat.rotate(90 + g_staffOffset, 0, 0, 1); // Orient horizontally/diagonally
        staffMat.rotate(90, 1, 0, 0);
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
    lFootMat.translate(0.0, -0.5, 0.0); // Ankle position
    lFootMat.rotate(g_leftFootAngle, 1, 0, 0); // Ankle bend
    lFootMat.scale(0.09, 0.05, 0.15);
    lFootMat.translate(0, 0, 0.5); // Extend foot forward
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
    rShinMat.translate(0.0, -0.5, 0.0);
    rShinMat.scale(0.09, 0.25, 0.09);
    drawCylinder(rShinMat, C_GOLD, 10);

    // Foot - positioned below shin
    var rFootMat = new Matrix4(rThighCoord);
    rFootMat.translate(0.0, -0.75, 0.0);
    rFootMat.scale(0.09, 0.05, 0.15);
    rFootMat.translate(0, 0, 0.5);
    drawCube(rFootMat, C_BLACK);
}

// --- UI Actions ---
function addActionForHtmlUI(){
    // Animation Toggle
    document.getElementById('animationOnButton').onclick = function() { g_animationOn = true; this.classList.add('active'); document.getElementById('animationOffButton').classList.remove('active'); };
    document.getElementById('animationOffButton').onclick = function() { g_animationOn = false; this.classList.add('active'); document.getElementById('animationOnButton').classList.remove('active'); };

    // Mouse rotation control
    var isDragging = false;
    var lastMouseX = 0;
    var lastMouseY = 0;
    
    canvas.onmousedown = function(ev) {
        // Shift-click triggers poke animation
        if (ev.shiftKey) {
            if (!g_pokeAnimation) {
                g_pokeAnimation = true;
                g_pokeStartTime = g_seconds;
                g_pokeProgress = 0;
            }
            return; // Don't start rotation drag on shift-click
        }
        isDragging = true;
        lastMouseX = ev.clientX;
        lastMouseY = ev.clientY;
    };
    
    canvas.onmouseup = function(ev) {
        isDragging = false;
    };
    
    canvas.onmouseleave = function(ev) {
        isDragging = false;
    };
    
    canvas.onmousemove = function(ev) {
        if (isDragging) {
            var deltaX = ev.clientX - lastMouseX;
            var deltaY = ev.clientY - lastMouseY;
            
            // Map mouse X movement to Y-axis rotation
            g_globalAngle += deltaX * 0.5;
            // Map mouse Y movement to X-axis rotation
            g_globalAngleX += deltaY * 0.5;
            
            // Clamp X rotation to avoid flipping
            if (g_globalAngleX > 90) g_globalAngleX = 90;
            if (g_globalAngleX < -90) g_globalAngleX = -90;
            
            lastMouseX = ev.clientX;
            lastMouseY = ev.clientY;
            
            // Update slider display to match
            document.getElementById('angleSlider').value = g_globalAngle;
            document.getElementById('angleValue').textContent = Math.round(g_globalAngle);
        }
    };

    // Global Rotate
    document.getElementById('angleSlider').addEventListener('input', function() { 
        g_globalAngle = parseFloat(this.value); 
        document.getElementById('angleValue').textContent = this.value;
        renderScene(); 
    });
    
    // Joints
    document.getElementById('rightArmSlider').addEventListener('input', function() { 
        g_rightArmAngle = parseFloat(this.value); 
        document.getElementById('rightArmValue').textContent = this.value;
        renderScene(); 
    });
    document.getElementById('rightForearmSlider').addEventListener('input', function() { 
        g_rightForearmAngle = parseFloat(this.value); 
        document.getElementById('rightForearmValue').textContent = this.value;
        renderScene(); 
    });
    document.getElementById('leftArmSlider').addEventListener('input', function() { 
        g_leftArmAngle = parseFloat(this.value); 
        document.getElementById('leftArmValue').textContent = this.value;
        renderScene(); 
    });
    document.getElementById('leftLegSlider').addEventListener('input', function() { 
        g_leftLegAngle = parseFloat(this.value); 
        document.getElementById('leftLegValue').textContent = this.value;
        renderScene(); 
    });
    document.getElementById('leftShinSlider').addEventListener('input', function() { 
        g_leftShinAngle = parseFloat(this.value); 
        document.getElementById('leftShinValue').textContent = this.value;
        renderScene(); 
    });
    document.getElementById('leftFootSlider').addEventListener('input', function() { 
        g_leftFootAngle = parseFloat(this.value); 
        document.getElementById('leftFootValue').textContent = this.value;
        renderScene(); 
    });
}