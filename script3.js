"use strict";

//var test = [];
//for (var i = 0; i < 2000; ++i) {
//
//    test.push(Math.round(Math.random()* 10))
//
//}
//console.log("test",test)
 var count7 = 0;
 var step = 2500
 var posStep = 45
 var pos1 = 0


  for (var i = 0; i < 9; ++i) {
  var divNum = document.createElement("div")
//  .setAttribute("id", i);

  var number = document.createTextNode(count7);
  divNum.appendChild(number);
  divNum.style.textAlign = "center"
  divNum.style.display = "inline-block";
  divNum.setAttribute("id", i);

  divNum.style.width = '100px';
  divNum.style.position = 'relative';
  divNum.style.left = pos1 + "px";

  var num = document.getElementById("num");
  num.appendChild(divNum);
  count7 += step;
//  pos1 += posStep;
//  posStep += 15
  }

// Source
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
//  var source = [];

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
//  var start = setInterval(testtest, repeat_timeout_ms);
  var start = setInterval(estimator, repeat_timeout_ms);
//On click (zoom)
  canvas.onmousedown = function(ev){click(ev, gl, canvas, a_position2);};


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
//        console.log(g_points)
        if (g_points[0] < (waterfallWidth+waterfallLeftMargin) && g_points[0] > waterfallLeftMargin && zoom_status == false)
        {
//
            zoom(g_points);
            g_points = [];
            zoom_status = true;
//            rebuildWaterfallState()

        } else if (g_points[0] < (waterfallWidth+waterfallLeftMargin) && g_points[0] > waterfallLeftMargin && zoom_status == true)
                       {
                           clearInterval(start);

                           sliceFrom = 0;
                           sliceTo = numChanels;
                           g_points = [];
                           start = setInterval(estimator, repeat_timeout_ms);
                           zoom_status = false;
                       }
//        else {
//            clearInterval(start);
//            sliceFrom = 0;
//            sliceTo = numChanels;
//            start = setInterval(estimator, repeat_timeout_ms);
//            g_points = [];
//        }
        count3 +=1;
//        console.log("count3" ,count3)
        g_points = [];

//        console.log(g_points);
    }
}



function zoom(points)
{

//  console.log(points[0], points[1] )
    var x = waterfallWidth - (Math.abs(parseInt(points[0]) - waterfallLeftMargin));
//    console.log(x)
//    var y = parseInt(points[1]) + 20;

    var from = x * (numChanels/waterfallWidth) - waterfallZoomSize/2
    var to = from + waterfallZoomSize

    if (from < 0) {
        sliceFrom = 0;
        sliceTo = waterfallZoomSize;
//        console.log("1", sliceFrom, sliceTo);
    } else if (to > numChanels) {
        sliceFrom = numChanels - waterfallZoomSize - 1;
        sliceTo = numChanels - 1;
//        console.log("2", sliceFrom, sliceTo);

    } else {
        sliceFrom = from;
        sliceTo = to;
//        console.log("3", sliceFrom, sliceTo);
    }

//    console.log(sliceFrom, sliceTo);


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
//    	if (array.byteLength == 0)
//    	{
//    	    setTimeout(estimator, repeat_timeout_ms);
//    	    return;
//    	}

    	var estimator_timestamp = estimatorArray.slice(0,8);
    	var estimator_duration = (new DataView(estimatorArray.slice(8,12))).getUint32(0);
    	var estimator_channels = (new DataView(estimatorArray.slice(12,13))).getUint8(0);
    	var estimator_length = (new DataView(estimatorArray.slice(13,17))).getUint32(0);
    	var estimator_data = new DataView(estimatorArray.slice(17));
//    	var plot_array = "Length, Amplitude\n";
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

//	    testtest()

            var sourceTo = plot_array.slice()
//            console.log(sourceTo)
//        console.log("plot", plot_array.length);
//        console.log("slice", sliceFrom, sliceTo);
            var zoom_array = plot_array.slice(sliceFrom, numChanels);
        if (count3  == 0)
        {
            var zoom_array = plot_array.slice(sliceFrom, numChanels);
//            var zoom_array = test.slice(sliceFrom, numChanels);

        } else
        {
            var zoom_array = plot_array.slice(sliceFrom, sliceTo);
//            var zoom_array = test.slice(sliceFrom, sliceTo);
        }
//        console.log("zoom", zoom_array);


        var num = Math.round(zoom_array.length/(waterfallWidth/pixelSize));
        var line = new Array();
        var setColor = new Array();
        var count4 = 0;

        for (var i = waterfallWidth/pixelSize; i > 0; --i){
          var t = zoom_array.slice(count4, num+count4);

          for (var j = t.length; j > 0; --j) {
            if (t[j-1] > lower_threshold)
            {
              line.push(i);
//              console.log("elem", t[j-1])
              setColor.push(parseInt(t[j-1]))
              break;
            }
          }

          count4 += num
        }
//        setColor = [];
//        console.log("arr", setColor)
//        console.log("set", getMaxOfArray(setColor))
        function getMaxOfArray(numArray) {
          return Math.max.apply(null, numArray);
        }

        play1(line, setColor)
//        setColor = [];

     }
     catch(e)
     {
     	alert(e.name);
     }
}

function testtest() {
 if (count3  == 0)
        {
//            var zoom_array = plot_array.slice(sliceFrom, numChanels);
            var zoom_array = test.slice(sliceFrom, numChanels);

        } else
        {
//            var zoom_array = plot_array.slice(sliceFrom, sliceTo);
            var zoom_array = test.slice(sliceFrom, sliceTo);
        }
//        console.log("zoom", zoom_array);


        var num = Math.round(zoom_array.length/(waterfallWidth/pixelSize));
        var line = new Array();
        var setColor = new Array();
        var count4 = 0;

        for (var i = waterfallWidth/pixelSize; i > 0; --i){
          var t = zoom_array.slice(count4, num+count4);

          for (var j = t.length; j > 0; --j) {
            if (t[j-1] > lower_threshold)
            {
              line.push(i);
//              console.log("elem", t[j-1])
              setColor.push(parseInt(t[j-1]))
              break;
            }
          }

          count4 += num
        }
//        setColor = [];
//        console.log("arr", setColor)
//        console.log("set", getMaxOfArray(setColor))
        function getMaxOfArray(numArray) {
          return Math.max.apply(null, numArray);
        }

        play1(line, setColor)
//        setColor = [];

     }



//function rebuildWaterfallState() {
//
////    var line1 = [];
////    waterfallState = [];
////    for (var i = 0; i <= source.length; ++i) {
////        var io = source[i];
////        console.log(io, source)
////        for (var j = 0; j <= io.length; ++j ) {
////            line1 = [];
////            var jo = io.slice(sliceFrom, sliceTo);
////            console.log(jo);
////            for (var t = 0; t <= jo.length; ++t) {
////                if (jo[t] > lower_threshold) {
////                    line1.push(j);
////                    break;
////                }
////                console.log("linen1" ,line1)
////            }
////            waterfallState.push(line1)
////
////        }
////
////
////    }
//
//
//
//
//
//        var line1 = new Array();
//        var setColor = new Array();
//        var count7 = 0;
//        waterfallState = [];
//        for (var f = source.length-1; f >= 0; --f) {
//
//            var sourceArray = source[f]
//
//            var sourceArray1 = sourceArray.slice(sliceFrom, sliceTo);
//
//            var num1 = Math.round(sourceArray1.length/(waterfallWidth/pixelSize));
//            for (var i = waterfallWidth/pixelSize; i > 0; --i){
////                line1 = [];
//              var t = sourceArray1.slice(count7, num1+count7);
//
//              for (var j = t.length; j > 0; --j) {
//                if (t[j-1] > lower_threshold)
//                {
//                  line1.push(i);
////                  console.log("elem", t[j-1])
//                  setColor.push(parseInt(t[j-1]))
//                  break;
//                }
//              }
//                      waterfallState.push(line1)
//
//              count7 += num1
//            }
//
////            line1 = [];
//        }
//        console.log("!!!!!", waterfallState)
//
//}


function play1(line, set_color)
{

//  setLine(gl, 0, 30);
//  gl.uniform4f(colorUniformLocation, li, po, jo, 1);
//  var primitiveType1 = gl.LINES;
//  var offset1 = 0;
//  var count1 = 2;
//  gl.drawArrays(primitiveType1, offset, count);


  setRectangle(gl, waterfallLeftMargin+pixelSize, 0, waterfallWidth, waterfallHeight);
  gl.uniform4f(colorUniformLocation, lo, po, jo, 1);
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);

  waterfallState.push(line)
//  source.push(set_source)

  colorState.push(set_color);



  var count1 = 0
  waterfallState = waterfallState.slice((waterfallHeight/pixelSize)*(-1))
//  source = source.slice((waterfallHeight/pixelSize)*(-1))
  colorState = colorState.slice((waterfallHeight/pixelSize)*(-1))
//    console.log("source", source)

//  console.log(colorState)/

  for (var i = waterfallState.length-1; i >= 0; --i)
  {
      for (var j = waterfallState[i].length-1; j >= 0; --j)
      {

          setRectangle(gl, (waterfallState[i][j]*pixelSize + waterfallLeftMargin), count1,  pixelSize, pixelSize);

//          console.log(Math.round(setColor[i][j]))
//            console.log(colorState[i][j])
          color(colorState[i][j])


//          gl.uniform4f(colorUniformLocation, li, pi, ji, 1);

          var primitiveType = gl.TRIANGLES;
          var offset = 0;
          var count = 6;
          gl.drawArrays(primitiveType, offset, count);
      }
  count1 += pixelSize
  }

}

function color(elem) {
//console.log(elem)
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

