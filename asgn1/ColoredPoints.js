// --- Global Variables ---
const POINT = 0, TRIANGLE = 1, CIRCLE = 2, CHUN = 3, PONG = 4;
let canvas, gl, a_Position, u_FragColor, u_PointSize;
let g_selectedType = POINT;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; 
let gSelectedSize = 5;
let g_shapeList = []; 
let g_pongGame = null;
let g_mouseX = 0.0;

// Shaders
var VSHADER_SOURCE = `
  attribute vec4 a_Position; 
  uniform float u_PointSize; 
  void main() { 
    gl_Position = a_Position; 
    gl_PointSize = u_PointSize; 
  }`;

var FSHADER_SOURCE = `
  precision mediump float; 
  uniform vec4 u_FragColor; 
  void main() { 
    gl_FragColor = u_FragColor; 
  }`;

function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');

    if (a_Position < 0 || !u_FragColor || !u_PointSize) {
        console.log('Failed to get storage location of variables');
        return;
    }
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  g_pongGame = new PongGame();
  addActionForHtmlUI();

  // Input listeners
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {
      let [x, y] = convertCoordinatesEventToGL(ev);
      g_mouseX = x; // Update global mouse X for the Pong paddle
      if(ev.buttons == 1) { click(ev); } 
  };

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  // Start the animation loop
  requestAnimationFrame(tick);
}

function tick() {
    // Update game logic if in Pong mode
    if (g_selectedType === PONG) {
        g_pongGame.update(g_mouseX);
    }
    renderAllShapes();
    requestAnimationFrame(tick);
}

function renderAllShapes() {
    var startTime = performance.now();
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw all static shapes stored in the list
    for(var i = 0; i < g_shapeList.length; i++) {
      g_shapeList[i].render();
    }

    // Draw Pong Game elements (ball and paddle) if active
    if (g_selectedType === PONG) {
        g_pongGame.render();
    }

    // Performance measurement and display
    var duration = performance.now() - startTime;
    sendTextToHTML("numdot: " + g_shapeList.length + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  let p;
  if (g_selectedType == CHUN) {
    p = new Chun();
    p.position = [x, y];
  } else if (g_selectedType == POINT) {
    p = new Point();
  } else if (g_selectedType == TRIANGLE) {
    p = new Triangle();
  } else if (g_selectedType == PONG) {
    // If we click while in pong mode, we don't necessarily want to draw static shapes
    return;
  } else {
    p = new Circle();
  }

  // Set properties for standard shapes
  if (g_selectedType !== CHUN && g_selectedType !== PONG) {
    p.position = [x, y];
    p.color = g_selectedColor.slice();
    p.size = gSelectedSize;
  }
  
  g_shapeList.push(p);
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; 
    var y = ev.clientY; 
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2) / (canvas.width/2);
    y = (canvas.height/2 - (y - rect.top)) / (canvas.height/2);

    return ([x, y]);
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (htmlElm) {
        htmlElm.innerHTML = text;
    }
}

function addActionForHtmlUI(){
    document.getElementById('pointButton').onclick = () => { g_selectedType = POINT; };
    document.getElementById('triangleButton').onclick = () => { g_selectedType = TRIANGLE; };
    document.getElementById('circleButton').onclick = () => { g_selectedType = CIRCLE; };
    
    document.getElementById('pongButton').onclick = () => { 
        g_selectedType = PONG; 
        g_pongGame.start(); 
    };

    document.getElementById('clear').onclick = () => { 
        g_shapeList = []; 
        renderAllShapes(); 
    };

    document.getElementById('spring').onchange = function() {
        if (this.checked) {
            g_selectedType = CHUN;
            g_shapeList = []; // Clear for the high-contrast Fai Chun effect
            let p = new Chun();
            p.position = [0.0, 0.0, 0.0];
            g_shapeList.push(p);
        } else {
            g_selectedType = POINT;
        }
    };

    // Sliders
    document.getElementById('redslider').oninput = function() { g_selectedColor[0] = this.value/100.0; };
    document.getElementById('greenslider').oninput = function() { g_selectedColor[1] = this.value/100.0; };
    document.getElementById('blueslider').oninput = function() { g_selectedColor[2] = this.value/100.0; };
    document.getElementById('sizeslider').oninput = function() { gSelectedSize = parseFloat(this.value); };
}
