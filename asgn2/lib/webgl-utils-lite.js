// Minimal WebGL utility functions to support CSE160 assignments
// Provides getWebGLContext(canvas) and initShaders(gl, vSrc, fSrc)

function getWebGLContext(canvas) {
  if (!canvas) return null;
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  return gl || null;
}

function initShaders(gl, vSrc, fSrc) {
  var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vSrc);
  var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fSrc);
  if (!vertexShader || !fragmentShader) {
    console.log('Failed to create shaders');
    return false;
  }

  var program = gl.createProgram();
  if (!program) {
    console.log('Failed to create program');
    return false;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    var error = gl.getProgramInfoLog(program);
    console.log('Failed to link program: ' + error);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return false;
  }

  gl.useProgram(program);
  gl.program = program;
  return true;
}

function loadShader(gl, type, source) {
  var shader = gl.createShader(type);
  if (!shader) {
    console.log('Unable to create shader');
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    var error = gl.getShaderInfoLog(shader);
    console.log('Failed to compile shader: ' + error);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
