class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2; // Default: use color
  }

  render() {
    var rgba = this.color;

    // Pass texture number
    gl.uniform1i(u_WhichTexture, this.textureNum);
    
    // Pass color
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass the matrix to u_ModelMatrix uniform
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Draw each face with proper normals
    // Front face (z = 0) - normal points toward -Z
    drawTriangle3DUVNormal(
      [0,0,0,  1,1,0,  1,0,0,   0,0,0,  0,1,0,  1,1,0],
      [0,0,  1,1,  1,0,   0,0,  0,1,  1,1],
      [0,0,-1,  0,0,-1,  0,0,-1,   0,0,-1,  0,0,-1,  0,0,-1]
    );

    // Back face (z = 1) - normal points toward +Z
    drawTriangle3DUVNormal(
      [0,0,1,  1,0,1,  1,1,1,   0,0,1,  1,1,1,  0,1,1],
      [0,0,  1,0,  1,1,   0,0,  1,1,  0,1],
      [0,0,1,  0,0,1,  0,0,1,   0,0,1,  0,0,1,  0,0,1]
    );

    // Top face (y = 1) - normal points toward +Y
    drawTriangle3DUVNormal(
      [0,1,0,  0,1,1,  1,1,1,   0,1,0,  1,1,1,  1,1,0],
      [0,0,  0,1,  1,1,   0,0,  1,1,  1,0],
      [0,1,0,  0,1,0,  0,1,0,   0,1,0,  0,1,0,  0,1,0]
    );

    // Bottom face (y = 0) - normal points toward -Y
    drawTriangle3DUVNormal(
      [0,0,0,  1,0,1,  0,0,1,   0,0,0,  1,0,0,  1,0,1],
      [0,0,  1,1,  0,1,   0,0,  1,0,  1,1],
      [0,-1,0,  0,-1,0,  0,-1,0,   0,-1,0,  0,-1,0,  0,-1,0]
    );

    // Right face (x = 1) - normal points toward +X
    drawTriangle3DUVNormal(
      [1,0,0,  1,1,1,  1,0,1,   1,0,0,  1,1,0,  1,1,1],
      [0,0,  1,1,  1,0,   0,0,  0,1,  1,1],
      [1,0,0,  1,0,0,  1,0,0,   1,0,0,  1,0,0,  1,0,0]
    );

    // Left face (x = 0) - normal points toward -X
    drawTriangle3DUVNormal(
      [0,0,0,  0,0,1,  0,1,1,   0,0,0,  0,1,1,  0,1,0],
      [0,0,  1,0,  1,1,   0,0,  1,1,  0,1],
      [-1,0,0,  -1,0,0,  -1,0,0,   -1,0,0,  -1,0,0,  -1,0,0]
    );
  }
}

// Standalone drawCube function that takes a Matrix parameter - with normals
function drawCube(M, color) {
  var rgba = color || [1.0, 1.0, 1.0, 1.0];

  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  gl.uniform1i(u_WhichTexture, -2); // Use color
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

  // Front face (z = 0) - normal points toward -Z
  drawTriangle3DUVNormal(
    [0,0,0,  1,1,0,  1,0,0,   0,0,0,  0,1,0,  1,1,0],
    [0,0,  1,1,  1,0,   0,0,  0,1,  1,1],
    [0,0,-1,  0,0,-1,  0,0,-1,   0,0,-1,  0,0,-1,  0,0,-1]
  );

  // Back face (z = 1) - normal points toward +Z
  drawTriangle3DUVNormal(
    [0,0,1,  1,0,1,  1,1,1,   0,0,1,  1,1,1,  0,1,1],
    [0,0,  1,0,  1,1,   0,0,  1,1,  0,1],
    [0,0,1,  0,0,1,  0,0,1,   0,0,1,  0,0,1,  0,0,1]
  );

  // Top face (y = 1) - normal points toward +Y
  drawTriangle3DUVNormal(
    [0,1,0,  0,1,1,  1,1,1,   0,1,0,  1,1,1,  1,1,0],
    [0,0,  0,1,  1,1,   0,0,  1,1,  1,0],
    [0,1,0,  0,1,0,  0,1,0,   0,1,0,  0,1,0,  0,1,0]
  );

  // Bottom face (y = 0) - normal points toward -Y
  drawTriangle3DUVNormal(
    [0,0,0,  1,0,1,  0,0,1,   0,0,0,  1,0,0,  1,0,1],
    [0,0,  1,1,  0,1,   0,0,  1,0,  1,1],
    [0,-1,0,  0,-1,0,  0,-1,0,   0,-1,0,  0,-1,0,  0,-1,0]
  );

  // Right face (x = 1) - normal points toward +X
  drawTriangle3DUVNormal(
    [1,0,0,  1,1,1,  1,0,1,   1,0,0,  1,1,0,  1,1,1],
    [0,0,  1,1,  1,0,   0,0,  0,1,  1,1],
    [1,0,0,  1,0,0,  1,0,0,   1,0,0,  1,0,0,  1,0,0]
  );

  // Left face (x = 0) - normal points toward -X
  drawTriangle3DUVNormal(
    [0,0,0,  0,0,1,  0,1,1,   0,0,0,  0,1,1,  0,1,0],
    [0,0,  1,0,  1,1,   0,0,  1,1,  0,1],
    [-1,0,0,  -1,0,0,  -1,0,0,   -1,0,0,  -1,0,0,  -1,0,0]
  );
}

// Draw a cylinder with normals
function drawCylinder(M, color, segments) {
  var rgba = color || [1.0, 1.0, 1.0, 1.0];
  var n = segments || 12;
  
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  gl.uniform1i(u_WhichTexture, -2);
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
  var angleStep = 360 / n;
  
  var vertices = [];
  var uvs = [];
  var normals = [];
  
  for (var i = 0; i < n; i++) {
    var angle1 = i * angleStep * Math.PI / 180;
    var angle2 = (i + 1) * angleStep * Math.PI / 180;
    
    var x1 = Math.cos(angle1) * 0.5;
    var z1 = Math.sin(angle1) * 0.5;
    var x2 = Math.cos(angle2) * 0.5;
    var z2 = Math.sin(angle2) * 0.5;
    
    // Normals for side (pointing outward radially)
    var nx1 = Math.cos(angle1);
    var nz1 = Math.sin(angle1);
    var nx2 = Math.cos(angle2);
    var nz2 = Math.sin(angle2);
    
    // Side faces
    vertices.push(x1, 0, z1,  x2, 0, z2,  x2, 1, z2);
    normals.push(nx1, 0, nz1,  nx2, 0, nz2,  nx2, 0, nz2);
    uvs.push(i/n, 0,  (i+1)/n, 0,  (i+1)/n, 1);
    
    vertices.push(x1, 0, z1,  x2, 1, z2,  x1, 1, z1);
    normals.push(nx1, 0, nz1,  nx2, 0, nz2,  nx1, 0, nz1);
    uvs.push(i/n, 0,  (i+1)/n, 1,  i/n, 1);
    
    // Top cap
    vertices.push(0, 1, 0,  x1, 1, z1,  x2, 1, z2);
    normals.push(0, 1, 0,  0, 1, 0,  0, 1, 0);
    uvs.push(0.5, 0.5,  0.5+x1, 0.5+z1,  0.5+x2, 0.5+z2);
    
    // Bottom cap
    vertices.push(0, 0, 0,  x2, 0, z2,  x1, 0, z1);
    normals.push(0, -1, 0,  0, -1, 0,  0, -1, 0);
    uvs.push(0.5, 0.5,  0.5+x2, 0.5+z2,  0.5+x1, 0.5+z1);
  }
  
  drawTriangle3DUVNormal(vertices, uvs, normals);
}

// Draw a cone with normals
function drawCone(M, color, segments) {
  var rgba = color || [1.0, 1.0, 1.0, 1.0];
  var n = segments || 12;
  
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  gl.uniform1i(u_WhichTexture, -2);
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
  var angleStep = 360 / n;
  
  var vertices = [];
  var uvs = [];
  var normals = [];
  
  for (var i = 0; i < n; i++) {
    var angle1 = i * angleStep * Math.PI / 180;
    var angle2 = (i + 1) * angleStep * Math.PI / 180;
    
    var x1 = Math.cos(angle1) * 0.5;
    var z1 = Math.sin(angle1) * 0.5;
    var x2 = Math.cos(angle2) * 0.5;
    var z2 = Math.sin(angle2) * 0.5;
    
    // Cone normals point outward and upward
    var nx1 = Math.cos(angle1);
    var nz1 = Math.sin(angle1);
    var nx2 = Math.cos(angle2);
    var nz2 = Math.sin(angle2);
    var ny = 0.5; // Upward component
    
    // Side face
    vertices.push(x1, 0, z1,  x2, 0, z2,  0, 1, 0);
    normals.push(nx1, ny, nz1,  nx2, ny, nz2,  0, 1, 0);
    uvs.push(i/n, 0,  (i+1)/n, 0,  0.5, 1);
    
    // Bottom cap
    vertices.push(0, 0, 0,  x2, 0, z2,  x1, 0, z1);
    normals.push(0, -1, 0,  0, -1, 0,  0, -1, 0);
    uvs.push(0.5, 0.5,  0.5+x2, 0.5+z2,  0.5+x1, 0.5+z1);
  }
  
  drawTriangle3DUVNormal(vertices, uvs, normals);
}

// Draw a sphere with normals (for lighting)
function drawSphere(M, color, latSegments, lonSegments) {
  var rgba = color || [1.0, 1.0, 1.0, 1.0];
  var latN = latSegments || 8;
  var lonN = lonSegments || 12;
  
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  gl.uniform1i(u_WhichTexture, -2);
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
  var vertices = [];
  var uvs = [];
  var normals = [];
  
  for (var lat = 0; lat < latN; lat++) {
    var theta1 = lat * Math.PI / latN;
    var theta2 = (lat + 1) * Math.PI / latN;
    
    for (var lon = 0; lon < lonN; lon++) {
      var phi1 = lon * 2 * Math.PI / lonN;
      var phi2 = (lon + 1) * 2 * Math.PI / lonN;
      
      // Four corners of this quad on unit sphere
      var x1 = Math.sin(theta1) * Math.cos(phi1);
      var y1 = Math.cos(theta1);
      var z1 = Math.sin(theta1) * Math.sin(phi1);
      
      var x2 = Math.sin(theta1) * Math.cos(phi2);
      var y2 = Math.cos(theta1);
      var z2 = Math.sin(theta1) * Math.sin(phi2);
      
      var x3 = Math.sin(theta2) * Math.cos(phi1);
      var y3 = Math.cos(theta2);
      var z3 = Math.sin(theta2) * Math.sin(phi1);
      
      var x4 = Math.sin(theta2) * Math.cos(phi2);
      var y4 = Math.cos(theta2);
      var z4 = Math.sin(theta2) * Math.sin(phi2);
      
      // Scale to 0.5 radius, offset to center at 0.5, 0.5, 0.5
      vertices.push(x1*0.5+0.5, y1*0.5+0.5, z1*0.5+0.5);
      vertices.push(x2*0.5+0.5, y2*0.5+0.5, z2*0.5+0.5);
      vertices.push(x4*0.5+0.5, y4*0.5+0.5, z4*0.5+0.5);
      
      // For sphere, normal = normalized position (from center)
      normals.push(x1, y1, z1);
      normals.push(x2, y2, z2);
      normals.push(x4, y4, z4);
      
      uvs.push(phi1/(2*Math.PI), theta1/Math.PI);
      uvs.push(phi2/(2*Math.PI), theta1/Math.PI);
      uvs.push(phi2/(2*Math.PI), theta2/Math.PI);
      
      // Second triangle
      vertices.push(x1*0.5+0.5, y1*0.5+0.5, z1*0.5+0.5);
      vertices.push(x4*0.5+0.5, y4*0.5+0.5, z4*0.5+0.5);
      vertices.push(x3*0.5+0.5, y3*0.5+0.5, z3*0.5+0.5);
      
      normals.push(x1, y1, z1);
      normals.push(x4, y4, z4);
      normals.push(x3, y3, z3);
      
      uvs.push(phi1/(2*Math.PI), theta1/Math.PI);
      uvs.push(phi2/(2*Math.PI), theta2/Math.PI);
      uvs.push(phi1/(2*Math.PI), theta2/Math.PI);
    }
  }
  
  drawTriangle3DUVNormal(vertices, uvs, normals);
}