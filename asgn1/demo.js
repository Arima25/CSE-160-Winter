// Demo Triangle - Runs on page load

function runDemo() {
    // Vertex Shader in GLSL
    var DEMO_VSHADER = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 1.0, 1.0);
        }`;

    // Fragment Shader in GLSL
    var DEMO_FSHADER = `
        precision mediump float;
        uniform vec4 u_BaseColor;
        void main() {
            gl_FragColor = u_BaseColor + vec4(1.0, 1.0, 0.0, 0.5);
        }`;

    // Setup canvas and WebGL context
    let canvas = document.getElementById('webgl');
    let gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    
    // Initialize shaders
    if (!initShaders(gl, DEMO_VSHADER, DEMO_FSHADER)) {
        console.log('Failed to initialize demo shaders.');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Javascript Snippet
    let vertices = new Float32Array([-1.0, -1.0, -1.0, 1.0, 1.0, 0.0]);

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let a_Position = gl.getAttribLocation(gl.program, 'a_position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    let u_BaseColor = gl.getUniformLocation(gl.program, "u_BaseColor");
    gl.uniform4f(u_BaseColor, 0.0, 0.0, 1.0, 0.5);

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
}
