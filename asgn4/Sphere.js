// Sphere class with normals for lighting
class Sphere {
  constructor() {
    this.type = 'sphere';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2; // Default: use color (not texture)
    
    // Sphere resolution
    this.latSegments = 12;
    this.lonSegments = 12;
  }

  render() {
    var rgba = this.color;
    var latN = this.latSegments;
    var lonN = this.lonSegments;
    
    // Pass texture number to shader
    gl.uniform1i(u_WhichTexture, this.textureNum);
    
    // Pass color
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
    // Pass model matrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    // Build sphere vertex and normal data
    var vertices = [];
    var normals = [];
    var uvs = [];
    
    for (var lat = 0; lat < latN; lat++) {
      var theta1 = lat * Math.PI / latN;
      var theta2 = (lat + 1) * Math.PI / latN;
      
      for (var lon = 0; lon < lonN; lon++) {
        var phi1 = lon * 2 * Math.PI / lonN;
        var phi2 = (lon + 1) * 2 * Math.PI / lonN;
        
        // Four corners of this quad on the sphere (centered at origin, radius 1)
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
        
        // For a unit sphere, normal = position (normalized)
        // Triangle 1: v1, v2, v4
        vertices.push(x1, y1, z1);
        vertices.push(x2, y2, z2);
        vertices.push(x4, y4, z4);
        normals.push(x1, y1, z1);
        normals.push(x2, y2, z2);
        normals.push(x4, y4, z4);
        
        // UVs for triangle 1
        uvs.push(phi1 / (2 * Math.PI), theta1 / Math.PI);
        uvs.push(phi2 / (2 * Math.PI), theta1 / Math.PI);
        uvs.push(phi2 / (2 * Math.PI), theta2 / Math.PI);
        
        // Triangle 2: v1, v4, v3
        vertices.push(x1, y1, z1);
        vertices.push(x4, y4, z4);
        vertices.push(x3, y3, z3);
        normals.push(x1, y1, z1);
        normals.push(x4, y4, z4);
        normals.push(x3, y3, z3);
        
        // UVs for triangle 2
        uvs.push(phi1 / (2 * Math.PI), theta1 / Math.PI);
        uvs.push(phi2 / (2 * Math.PI), theta2 / Math.PI);
        uvs.push(phi1 / (2 * Math.PI), theta2 / Math.PI);
      }
    }
    
    drawTriangle3DUVNormal(vertices, uvs, normals);
  }
}

// Function to draw sphere without lighting (for light marker)
function drawSphereNoLighting(M, color, segments) {
  var rgba = color || [1.0, 1.0, 1.0, 1.0];
  var n = segments || 8;
  
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  gl.uniform1i(u_WhichTexture, -2); // Use color
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
  var vertices = [];
  var normals = [];
  var uvs = [];
  
  for (var lat = 0; lat < n; lat++) {
    var theta1 = lat * Math.PI / n;
    var theta2 = (lat + 1) * Math.PI / n;
    
    for (var lon = 0; lon < n; lon++) {
      var phi1 = lon * 2 * Math.PI / n;
      var phi2 = (lon + 1) * 2 * Math.PI / n;
      
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
      
      vertices.push(x1, y1, z1);
      vertices.push(x2, y2, z2);
      vertices.push(x4, y4, z4);
      normals.push(0, 1, 0); // Dummy normals for light marker
      normals.push(0, 1, 0);
      normals.push(0, 1, 0);
      uvs.push(0, 0, 0, 0, 0, 0);
      
      vertices.push(x1, y1, z1);
      vertices.push(x4, y4, z4);
      vertices.push(x3, y3, z3);
      normals.push(0, 1, 0);
      normals.push(0, 1, 0);
      normals.push(0, 1, 0);
      uvs.push(0, 0, 0, 0, 0, 0);
    }
  }
  
  drawTriangle3DUVNormal(vertices, uvs, normals);
}
