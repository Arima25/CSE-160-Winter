
// Optimized Cube Rendering to avoid buffer re-creation
// We create the buffers ONCE and reuse them.

let g_cubeBuffer = null;
let g_cubeUVBuffer = null;
let g_cubeVertices = null;
let g_cubeUVs = null;

function initCubeBuffers() {
    // 36 vertices (6 faces * 2 triangles * 3 vertices)
    // Coords: x, y, z
    g_cubeVertices = new Float32Array([
        // Front (0,0,0) -> (1,1,0)
        0,0,0,  1,1,0,  1,0,0,
        0,0,0,  0,1,0,  1,1,0,
        // Back (0,0,1) -> (1,1,1)
        0,0,1,  1,0,1,  1,1,1,
        0,0,1,  1,1,1,  0,1,1,
        // Top (0,1,0) -> (1,1,1)
        0,1,0,  0,1,1,  1,1,1,
        0,1,0,  1,1,1,  1,1,0,
        // Bottom (0,0,0) -> (1,0,1)
        0,0,0,  1,0,1,  0,0,1,
        0,0,0,  1,0,0,  1,0,1,
        // Right (1,0,0) -> (1,1,1)
        1,0,0,  1,1,1,  1,0,1,
        1,0,0,  1,1,0,  1,1,1,
        // Left (0,0,0) -> (0,1,1)
        0,0,0,  0,0,1,  0,1,1,
        0,0,0,  0,1,1,  0,1,0
    ]);

    g_cubeUVs = new Float32Array([
        // Front
        0,0, 1,1, 1,0,
        0,0, 0,1, 1,1,
        // Back
        0,0, 1,0, 1,1,
        0,0, 1,1, 0,1,
        // Top
        0,0, 0,1, 1,1,
        0,0, 1,1, 1,0,
        // Bottom
        0,1, 1,0, 0,0,
        0,1, 1,1, 1,0,
        // Right
        0,0, 1,1, 1,0,
        0,0, 0,1, 1,1,
        // Left
        0,1, 1,1, 1,0,
        0,1, 0,0, 0,1 // corrected manual uvs for consistency
    ]);

    g_cubeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, g_cubeVertices, gl.STATIC_DRAW);

    g_cubeUVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeUVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, g_cubeUVs, gl.STATIC_DRAW);
}

class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2; // Default to using color
  }

  render() {
      // renderFast is the new standard
      this.renderFast();
  }
  
  renderFast() {
    if (g_cubeBuffer === null) {
        initCubeBuffers();
    }

    // Pass uniforms
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    // Texture/Color Logic
    if (typeof u_whichTexture !== 'undefined') {
        if (this.textureNum == -2) {
            // Using Color
            gl.uniform1i(u_whichTexture, -2);
            gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        } else {
             // Using Texture
             gl.uniform1i(u_whichTexture, this.textureNum);
             // We can still pass a color tint if shader supports it, but simple shader ignores u_FragColor when texturing usually. 
             // My shader mixes them? No, it switches.
        }
    }

    // Bind Buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeUVBuffer);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    // Draw all 36 vertices (12 triangles) at once
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}

// Standalone drawCube function that takes a Matrix parameter
function drawCube(M, color) {
  // Default color is white if not provided
  var rgba = color || [1.0, 1.0, 1.0, 1.0];

  // Pass the matrix to u_ModelMatrix uniform
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);

  // Front face (z = 0)
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  drawTriangle3D([0,0,0,  1,1,0,  1,0,0]);
  drawTriangle3D([0,0,0,  0,1,0,  1,1,0]);

  // Back face (z = 1) - slightly darker
  gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
  drawTriangle3D([0,0,1,  1,0,1,  1,1,1]);
  drawTriangle3D([0,0,1,  1,1,1,  0,1,1]);

  // Top face (y = 1) - slightly different shade
  gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
  drawTriangle3D([0,1,0,  0,1,1,  1,1,1]);
  drawTriangle3D([0,1,0,  1,1,1,  1,1,0]);

  // Bottom face (y = 0) - darker
  gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
  drawTriangle3D([0,0,0,  1,0,1,  0,0,1]);
  drawTriangle3D([0,0,0,  1,0,0,  1,0,1]);

  // Right face (x = 1)
  gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);
  drawTriangle3D([1,0,0,  1,1,1,  1,0,1]);
  drawTriangle3D([1,0,0,  1,1,0,  1,1,1]);

  // Left face (x = 0)
  gl.uniform4f(u_FragColor, rgba[0]*0.75, rgba[1]*0.75, rgba[2]*0.75, rgba[3]);
  drawTriangle3D([0,0,0,  0,0,1,  0,1,1]);
  drawTriangle3D([0,0,0,  0,1,1,  0,1,0]);
}

// Draw a cylinder - centered at origin, extends along Y axis
// Radius is 0.5, height is 1 (scale with matrix)
function drawCylinder(M, color, segments) {
  var rgba = color || [1.0, 1.0, 1.0, 1.0];
  var n = segments || 12; // Number of segments around the cylinder
  
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  
  var angleStep = 360 / n;
  
  for (var i = 0; i < n; i++) {
    var angle1 = i * angleStep * Math.PI / 180;
    var angle2 = (i + 1) * angleStep * Math.PI / 180;
    
    var x1 = Math.cos(angle1) * 0.5;
    var z1 = Math.sin(angle1) * 0.5;
    var x2 = Math.cos(angle2) * 0.5;
    var z2 = Math.sin(angle2) * 0.5;
    
    // Side face (two triangles per segment) - slight shading variation
    var shade = 0.8 + 0.2 * Math.cos(angle1);
    gl.uniform4f(u_FragColor, rgba[0]*shade, rgba[1]*shade, rgba[2]*shade, rgba[3]);
    
    // Bottom triangle of side
    drawTriangle3D([x1, 0, z1,  x2, 0, z2,  x2, 1, z2]);
    // Top triangle of side
    drawTriangle3D([x1, 0, z1,  x2, 1, z2,  x1, 1, z1]);
    
    // Top cap
    gl.uniform4f(u_FragColor, rgba[0]*0.95, rgba[1]*0.95, rgba[2]*0.95, rgba[3]);
    drawTriangle3D([0, 1, 0,  x1, 1, z1,  x2, 1, z2]);
    
    // Bottom cap
    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3D([0, 0, 0,  x2, 0, z2,  x1, 0, z1]);
  }
}

// Draw a cone - base at y=0, tip at y=1, radius 0.5
function drawCone(M, color, segments) {
  var rgba = color || [1.0, 1.0, 1.0, 1.0];
  var n = segments || 12;
  
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  
  var angleStep = 360 / n;
  
  for (var i = 0; i < n; i++) {
    var angle1 = i * angleStep * Math.PI / 180;
    var angle2 = (i + 1) * angleStep * Math.PI / 180;
    
    var x1 = Math.cos(angle1) * 0.5;
    var z1 = Math.sin(angle1) * 0.5;
    var x2 = Math.cos(angle2) * 0.5;
    var z2 = Math.sin(angle2) * 0.5;
    
    // Side face (triangle from base to tip)
    var shade = 0.8 + 0.2 * Math.cos(angle1);
    gl.uniform4f(u_FragColor, rgba[0]*shade, rgba[1]*shade, rgba[2]*shade, rgba[3]);
    drawTriangle3D([x1, 0, z1,  x2, 0, z2,  0, 1, 0]);
    
    // Bottom cap
    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3D([0, 0, 0,  x2, 0, z2,  x1, 0, z1]);
  }
}

// Draw a sphere approximation using latitude/longitude segments
function drawSphere(M, color, latSegments, lonSegments) {
  var rgba = color || [1.0, 1.0, 1.0, 1.0];
  var latN = latSegments || 8;
  var lonN = lonSegments || 12;
  
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  
  for (var lat = 0; lat < latN; lat++) {
    var theta1 = lat * Math.PI / latN;
    var theta2 = (lat + 1) * Math.PI / latN;
    
    for (var lon = 0; lon < lonN; lon++) {
      var phi1 = lon * 2 * Math.PI / lonN;
      var phi2 = (lon + 1) * 2 * Math.PI / lonN;
      
      // Four corners of this quad on the sphere
      var x1 = Math.sin(theta1) * Math.cos(phi1) * 0.5;
      var y1 = Math.cos(theta1) * 0.5;
      var z1 = Math.sin(theta1) * Math.sin(phi1) * 0.5;
      
      var x2 = Math.sin(theta1) * Math.cos(phi2) * 0.5;
      var y2 = Math.cos(theta1) * 0.5;
      var z2 = Math.sin(theta1) * Math.sin(phi2) * 0.5;
      
      var x3 = Math.sin(theta2) * Math.cos(phi1) * 0.5;
      var y3 = Math.cos(theta2) * 0.5;
      var z3 = Math.sin(theta2) * Math.sin(phi1) * 0.5;
      
      var x4 = Math.sin(theta2) * Math.cos(phi2) * 0.5;
      var y4 = Math.cos(theta2) * 0.5;
      var z4 = Math.sin(theta2) * Math.sin(phi2) * 0.5;
      
      // Shading based on position
      var shade = 0.7 + 0.3 * (y1 + 0.5);
      gl.uniform4f(u_FragColor, rgba[0]*shade, rgba[1]*shade, rgba[2]*shade, rgba[3]);
      
      // Two triangles for this quad
      drawTriangle3D([x1+0.5, y1+0.5, z1+0.5,  x2+0.5, y2+0.5, z2+0.5,  x4+0.5, y4+0.5, z4+0.5]);
      drawTriangle3D([x1+0.5, y1+0.5, z1+0.5,  x4+0.5, y4+0.5, z4+0.5,  x3+0.5, y3+0.5, z3+0.5]);
    }
  }
}