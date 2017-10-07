"use strict";


  var estimatorUrl = "http://87.245.204.8/fastcgi-device/vibro/estimator.bin";
  var estimatorHttp = null;
  var timestamp_str="0x0";
  var estimatorPlot = null;
  var numChanels;
  var count3 = 0;
  var zoom_status = false;
  var g_points = [];
  var waterfallState = new Array();
  var colorState = [];
  var sliceFrom = 0;
  var sliceTo = 0;
  var count7 = 0;
  var step = 2500;

//  Settings
  var pixelSize = 2;
  var waterfallLeftMargin = 50;
  var repeat_timeout_ms = 500;
  var waterfallWidth = 800;
  var waterfallHeight = 700;
  var waterfallZoomSize = 400;
  var lower_threshold = 10;


//  Color
  var lo, po, jo, red, green, blue;

  lo = 0.0;
  po = 0.0;
  jo = 0.0;

  red =   0.9;
  green = 0.9;
  blue =  0.9;


// WebGL
  var canvas = document.getElementById("c");
  var gl = canvas.getContext("webgl");
  var program = webglUtils.createProgramFromScripts(gl, ["2d-vertex-shader", "2d-fragment-shader"]);
  var a_position2 = gl.getAttribLocation(program, 'a_position2')
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
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

//Run
  bottomLine();
  var start = setInterval(estimator, repeat_timeout_ms);
  canvas.onmousedown = function(ev){click(ev, gl, canvas, a_position2);};

function bottomLine() {



      for (var i = 0; i < 9; ++i)
      {
            var divNum = document.createElement("div")
            var number = document.createTextNode(count7);
            divNum.appendChild(number);
            divNum.style.textAlign = "center"
            divNum.style.display = "inline-block";
            divNum.setAttribute("id", i);
            divNum.style.width = '100px';
            divNum.style.position = 'relative';
            var num = document.getElementById("num");
            num.appendChild(divNum);
            count7 += step;
      }
}


function click(ev, gl, canvas, a_position2)
{
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();

    g_points.push(x);
    g_points.push(y);

    var len = g_points.length
    waterfallState = [];
    colorState = [];
    for (var i = 0; i < len; i += 2){
        gl.vertexAttrib3f(a_position2, g_points[i], g_points[i+1], 0.0);
        if (g_points[0] < (waterfallWidth+waterfallLeftMargin) && g_points[0] > waterfallLeftMargin && zoom_status == false)
        {
            zoom(g_points);
            g_points = [];
            zoom_status = true;
               for (var i = 0; i < 9; ++i)
                  {
                        var num = document.getElementById("num");
                        var num1 = document.getElementById(i);
                        num.removeChild(num1);
                  }

        } else if (g_points[0] < (waterfallWidth+waterfallLeftMargin) && g_points[0] > waterfallLeftMargin && zoom_status == true)
        {
            clearInterval(start);
            sliceFrom = 0;
            sliceTo = numChanels;
            g_points = [];
            for (var i = 0; i < 9; ++i)
            {
                  var num = document.getElementById("num");
                  var num1 = document.getElementById(i);
                  num.removeChild(num1);
            }
            count7 = 0;
            step = 2500;
            bottomLine();
            start = setInterval(estimator, repeat_timeout_ms);
            zoom_status = false;
        }
        count3 +=1;
        g_points = [];

    }
}



function zoom(points)
{
    var x = (Math.abs(parseInt(points[0]) - waterfallLeftMargin));
    var from = x * (numChanels/waterfallWidth) - waterfallZoomSize/2
    var to = from + waterfallZoomSize

    if (from < 0) {
        sliceFrom = 0;
        sliceTo = waterfallZoomSize;
    } else if (to > numChanels) {
        sliceFrom = numChanels - waterfallZoomSize - 1;
        sliceTo = numChanels - 1;
    } else {
        sliceFrom = from;
        sliceTo = to;
    }
    count7 = sliceFrom;
    step = waterfallZoomSize / 8;
    bottomLine();
}


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

    	var estimatorArray = estimatorHttp.response;
    	var estimator_timestamp = estimatorArray.slice(0,8);
    	var estimator_duration = (new DataView(estimatorArray.slice(8,12))).getUint32(0);
    	var estimator_channels = (new DataView(estimatorArray.slice(12,13))).getUint8(0);
    	var estimator_length = (new DataView(estimatorArray.slice(13,17))).getUint32(0);
    	var estimator_data = new DataView(estimatorArray.slice(17));
	var points_count = 4000;
        var plot_array = new Array(estimator_length);
        numChanels = estimator_length

	    if (estimatorPlot == null)
	    {
	        var n = 1;
	        for (var k = 0; k < estimator_length; k += n)
	        {
		    plot_array[k] = parseInt(estimator_data.getFloat32(4*k));
	        }
	    }

            var sourceTo = plot_array.slice();
            var zoom_array = plot_array.slice(sliceFrom, numChanels);

        if (count3  == 0)
        {
            var zoom_array = plot_array.slice(sliceFrom, numChanels);

        } else
        {
            var zoom_array = plot_array.slice(sliceFrom, sliceTo);
        }



        var num = Math.round(zoom_array.length/(waterfallWidth/pixelSize));
        var line = new Array();
        var setColor = new Array();
        var count4 = 0;

        for (var i = 0; i < waterfallWidth/pixelSize; ++i){
          var t = zoom_array.slice(count4, num+count4);

          for (var j = t.length; j > 0; --j) {
            if (t[j-1] > lower_threshold)
            {
              line.push(i);
              setColor.push(parseInt(t[j-1]))
              break;
            }
          }
          count4 += num
        }

        play1(line, setColor)

     }
     catch(e)
     {
     	alert(e.name);
     }
}

function play1(line, set_color)
{
  setRectangle(gl, waterfallLeftMargin+pixelSize, 0, waterfallWidth, waterfallHeight);
  gl.uniform4f(colorUniformLocation, lo, po, jo, 1);
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);

  waterfallState.push(line)
  colorState.push(set_color);

  var count1 = 0;
  waterfallState = waterfallState.slice((waterfallHeight/pixelSize)*(-1));
  colorState = colorState.slice((waterfallHeight/pixelSize)*(-1));

  for (var i = waterfallState.length-1; i >= 0; --i)
  {
      for (var j = waterfallState[i].length-1; j >= 0; --j)
      {

          setRectangle(gl, (waterfallState[i][j]*pixelSize + waterfallLeftMargin), count1,  pixelSize, pixelSize);

          color(colorState[i][j]);

          var primitiveType = gl.TRIANGLES;
          var offset = 0;
          var count = 6;
          gl.drawArrays(primitiveType, offset, count);
      }
  count1 += pixelSize
  }

}

function color(elem) {
    if (elem >3 && elem < 10)
    {
        gl.uniform4f(colorUniformLocation, red - 0.4, green - 0.1, blue, 1);
    } else if (elem >3 && elem < 30)
    {
        gl.uniform4f(colorUniformLocation, red - 0.5, green - 0.2, blue, 1);
    } else if (elem >30 && elem < 60)
    {
        gl.uniform4f(colorUniformLocation, red - 0.6, green - 0.3, blue, 1);
    } else if (elem >60 && elem < 90)
    {
        gl.uniform4f(colorUniformLocation, red - 0.7, green - 0.4, blue, 1);
    } else if (elem >90 && elem < 120)
    {
        gl.uniform4f(colorUniformLocation, red - 0.8, green - 0.5, blue, 1);
    } else if (elem >120)
    {
        gl.uniform4f(colorUniformLocation, red, green, blue, 1);
    }
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

