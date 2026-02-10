// OBJModel - Simple non-module OBJ loader for CSE160
// Usage: 
//   let model = new OBJModel();
//   await model.load(gl, 'filename.obj');
//   model.render(gl, a_Position, a_Normal, u_ModelMatrix, u_FragColor, u_WhichTexture);

class OBJModel {
    constructor() {
        this.vertices = [];  
        this.normals = [];   
        this.isLoaded = false;
        this.vertexBuffer = null;
        this.normalBuffer = null;
        this.numVertices = 0;
        
        this.matrix = new Matrix4();
        this.color = [1.0, 1.0, 1.0, 1.0];
    }
    
    async load(gl, url) {
        try {
            console.log('OBJModel: Fetching', url);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const text = await response.text();
            console.log('OBJModel: File loaded, size:', text.length, 'chars');
            
            this.parse(text);
            this.createBuffers(gl);
            this.isLoaded = true;
            
            console.log('OBJModel: Ready!', this.numVertices, 'vertices');
            return true;
        } catch (error) {
            console.error('OBJModel load error:', error);
            return false;
        }
    }
    
    parse(text) {
        const rawVertices = [];
        const rawNormals = [];
        
        const lines = text.split('\n');
        let faceCount = 0;
        
        for (let line of lines) {
            line = line.trim();
            if (line.length === 0 || line.startsWith('#')) continue;
            
            const parts = line.split(/\s+/);
            const type = parts[0];
            
            if (type === 'v') {
                rawVertices.push([
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                ]);
            } else if (type === 'vn') {
                rawNormals.push([
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                ]);
            } else if (type === 'f') {
                const faceVerts = [];
                const faceNorms = [];
                
                for (let i = 1; i < parts.length; i++) {
                    const indices = parts[i].split('/');
                    const vIdx = parseInt(indices[0]) - 1;
                    faceVerts.push(rawVertices[vIdx]);
                    
                    if (indices.length >= 3 && indices[2]) {
                        const nIdx = parseInt(indices[2]) - 1;
                        faceNorms.push(rawNormals[nIdx]);
                    } else {
                        faceNorms.push(null);
                    }
                }
                
                // Triangulate (fan method for quads/polygons)
                for (let i = 1; i < faceVerts.length - 1; i++) {
                    this.addTriangle(
                        faceVerts[0], faceNorms[0],
                        faceVerts[i], faceNorms[i],
                        faceVerts[i+1], faceNorms[i+1]
                    );
                    faceCount++;
                }
            }
        }
        
        this.numVertices = this.vertices.length / 3;
        console.log('OBJModel: Parsed', rawVertices.length, 'vertices,', rawNormals.length, 'normals,', faceCount, 'triangles');
    }
    
    addTriangle(v0, n0, v1, n1, v2, n2) {
        // Vertex 0
        this.vertices.push(v0[0], v0[1], v0[2]);
        this.normals.push(n0 ? n0[0] : 0, n0 ? n0[1] : 1, n0 ? n0[2] : 0);
        
        // Vertex 1
        this.vertices.push(v1[0], v1[1], v1[2]);
        this.normals.push(n1 ? n1[0] : 0, n1 ? n1[1] : 1, n1 ? n1[2] : 0);
        
        // Vertex 2
        this.vertices.push(v2[0], v2[1], v2[2]);
        this.normals.push(n2 ? n2[0] : 0, n2 ? n2[1] : 1, n2 ? n2[2] : 0);
    }
    
    createBuffers(gl) {
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        
        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
    }
    
    render(gl, a_Position, a_Normal, a_UV, u_ModelMatrix, u_FragColor, u_WhichTexture) {
        if (!this.isLoaded) return;
        
        // 1. Set Texture/Color uniforms
        gl.uniform1i(u_WhichTexture, -2); // Use solid color mode
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        
        // 2. Set Model Matrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // 3. Bind Coordinate Buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // 4. Bind Normal Buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        // 5. Disable UV Buffer (Because this OBJ loader doesn't have UVs yet)
        // If we leave this enabled, WebGL crashes reading non-existent data.
        gl.disableVertexAttribArray(a_UV); 

        // 6. Draw
        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
        
        // 7. Re-enable UV array for the other shapes (Cubes/Spheres) to work next frame
        gl.enableVertexAttribArray(a_UV);
    }
}
