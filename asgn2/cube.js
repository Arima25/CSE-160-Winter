class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }

  render() {
    var rgba = this.color;

    // Pass the matrix to u_ModelMatrix uniform
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

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