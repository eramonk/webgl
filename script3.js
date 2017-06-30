"use strict";

var estimatorUrl = "http://87.245.204.8/fastcgi-device/vibro/estimator.bin";
var estimatorHttp = null;
var timestamp_str="0x0";
var estimatorPlot = null;
var repeat_timeout_ms = 500;
var array = new Array()


  var canvas = document.getElementById("c");
  var gl = canvas.getContext("webgl");
  if (!gl) {
//    return;
  }

  var program = webglUtils.createProgramFromScripts(gl, ["2d-vertex-shader", "2d-fragment-shader"]);

  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  var colorUniformLocation = gl.getUniformLocation(program, "u_color");

  var positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

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

  var lo, po, jo, li, pi, ji;

  lo = 0.0;
  po = 0.0;
  jo = 0.0;

  li = 0.0;
  pi = 0.6;
  ji = 0.9;

  var waterfallWidth = 400
  var waterfallHeight = 360



setInterval(estimator, 500);


function estimator()
{

    try
    {
    	estimatorHttp = new XMLHttpRequest();
    	var request = estimatorUrl;
    	estimatorHttp.open("GET", request, true);
    	estimatorHttp.responseType = "arraybuffer";
    	estimatorHttp.onload = receiveData;
    	estimatorHttp.send(null);
    }
    catch(e)
    {
      console.log("boom")
    	alert(e.name());
    }
}


function receiveData()
{
     try
     {
      console.log(estimatorHttp.status)
    	if (estimatorHttp.status != 200)
    	{
    	    return;
    	}

    	var array = estimatorHttp.response;
//    	if (array.byteLength == 0)
//    	{
//    	    setTimeout(estimator, repeat_timeout_ms);
//    	    return;
//    	}

    	var estimator_timestamp = array.slice(0,8);
    	var estimator_duration = (new DataView(array.slice(8,12))).getUint32(0);
    	var estimator_channels = (new DataView(array.slice(12,13))).getUint8(0);
    	var estimator_length = (new DataView(array.slice(13,17))).getUint32(0);
    	var estimator_data = new DataView(array.slice(17));
    	var plot_array = "Length, Amplitude\n";
	    var points_count = 4000;


var plot_array = new Array(estimator_length);
	if (estimatorPlot == null)
	{
	    var n = 1;//Math.ceil(estimator_length / points_count);
	    for (var k = 0; k < estimator_length; k += n)
	    {
//		plot_array += k + ",";
		plot_array[k] = parseInt(estimator_data.getFloat32(4*k));
//		plot_array += "\n";
	    }
	    // estimatorPlot = new Dygraph(document.getElementById("graphdiv"), plot_array);
	}
  var num = plot_array.length/400
  var ar = new Array()
  var count4 = 0

  for (var i = 400; i >= 0; --i){
    var t = plot_array.slice(count4, num+count4)

    for (var j = t.length-1; j > 0; --j) {
      if (t[j] > 10)
      {
        ar.push(i);
        break;
      }
    }
    count4 += num
  }

  play1(ar)

    }
     catch(e)
     {
     	alert(e.name);
     }
  }


function play1(ar) {

//  setLine(gl, 0, 30);
//  gl.uniform4f(colorUniformLocation, li, po, jo, 1);
//  var primitiveType1 = gl.LINES;
//  var offset1 = 0;
//  var count1 = 2;
//  gl.drawArrays(primitiveType1, offset, count);


  setRectangle(gl, 50, 0, waterfallWidth*2, waterfallHeight*2);
  gl.uniform4f(colorUniformLocation, lo, po, jo, 1);
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);

  array.push(ar)
  var count1 = 0
  array = array.slice(-360)

  for (var i = array.length-1; i >= 0; --i){
  for (var j = array[i].length-1; j >= 0; --j){

  setRectangle(gl, array[i][j]*2+50, count1,  2, 2);

  gl.uniform4f(colorUniformLocation, li, pi, ji, 1);

  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
  }
  count1 += 2
 }

}

function setLine(gl, x, y) {

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x, y,



  ]), gl.STATIC_DRAW);



}


function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}

