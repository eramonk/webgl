//нижняя линейка
function main() {

  var canvas = document.getElementById("c1");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  var program = webglUtils.createProgramFromScripts(gl, ["2d-vertex-shader1", "2d-fragment-shader1"]);
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var x = 52;
  var y = 3
  var z = 15

  var positions = [
    x,  y,
    x + 800, y,
    x + 1, y,
    x + 1, z,
    x + 100, y,
    x + 100, z,
    x + 200, y,
    x + 200, z,
    x + 300, y,
    x + 300, z,
    x + 400, y,
    x + 400, z,
    x + 500, y,
    x + 500, z,
    x + 600, y,
    x + 600, z,
    x + 700, y,
    x + 700, z,
    x + 800-2, y,
    x + 800-2, z
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  var size = 2;
  var type = gl.FLOAT;
  var normalize = false;
  var stride = 0;
  var offset = 0;
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset)
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  var primitiveType = gl.LINES;
  var offset = 0;
  var count = 20;
  gl.drawArrays(primitiveType, offset, count);
}

main();