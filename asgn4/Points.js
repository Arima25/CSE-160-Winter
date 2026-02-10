class Point {
  constructor() {
    this.type = 'point';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;

    // FIX: Disable the vertex attribute array so we can draw a single point manually [00:05:11]
    gl.disableVertexAttribArray(a_Position);

    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(u_PointSize, size);
    gl.uniformMatrix4fv(u_ModelMatrix, false, g_identityMatrix.elements);

    gl.drawArrays(gl.POINTS, 0, 1);
  }
}
