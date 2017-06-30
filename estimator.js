var estimatorUrl = "http://87.245.204.8/fastcgi-device/vibro/estimator.bin";
var estimatorHttp = null;
var timestamp_str="0x0";
var estimatorPlot = null;
var repeat_timeout_ms = 500;

estimator()

// function timestampToHexString(timestamp)
// {
//     var timestamp_str = "0x";
//     var timestamp_data = new DataView(timestamp);
//     try
//     {
//     	var hex_table = ["0","1","2","3","4","5","6","7",
//     			 "8","9","A","B","C","D","E","F"];
//
//     	for (var k = 0; k < 8; ++k)
//     	{
// 	    var value = timestamp_data.getUint8(k);
//     	    timestamp_str += hex_table[value >> 4];
//     	    timestamp_str += hex_table[value % 16];
//     	}
//
//     }
//     catch(e)
//     {
//
//     	alert(e.name);
//     }
//
//     return timestamp_str;
// }


function receiveData()
{
    // try
    // {
      console.log(estimatorHttp.status)
    	if (estimatorHttp.status != 200)
    	{
    	    /////FIXME: schedule new request after some timeout
    	    alert(estimatorHttp.status);
    	    return;
    	}

    	var array = estimatorHttp.response;
    	if (array.byteLength == 0)
    	{
    	    setTimeout(estimator, repeat_timeout_ms);
    	    return;
    	}

    	var estimator_timestamp = array.slice(0,8);
    	var estimator_duration = (new DataView(array.slice(8,12))).getUint32(0);
    	var estimator_channels = (new DataView(array.slice(12,13))).getUint8(0);
    	var estimator_length = (new DataView(array.slice(13,17))).getUint32(0);
    	var estimator_data = new DataView(array.slice(17));
    	var plot_array = "Length, Amplitude\n";
	var points_count = 4000;
  console.log(estimator_data.getFloat32(0))
console.log(array)
console.log(estimator_timestamp +" timestamp")
console.log(estimator_channels + " chanels")
console.log(estimator_length + " length")
console.log(estimator_duration + " duration")
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

  console.log(count4)
  console.log(plot_array)
  for (var i = 400; i >= 0; --i){
    var t = plot_array.slice(count4, num+count4)
//    console.log(t)
//        t.map(function (e) {
//        if (e > 3) {
//        ar.push(i);
//
//        }
//    })


    for (var j = t.length-1; j > 0; --j) {
      if (t[j] > 5)
      {
        ar.push(i);
        break;
      }

    }


    count4 += num


  }

  console.log(ar)

// 	else
// 	{
// 	    plot_array += "0" + "," + estimator_data.getFloat32(0) + "\n";
// 	    //var area = estimatorPlot.getArea();
// 	    //var k1 = Math.floor(estimatorPlot.toDataXCoord(area.x) + 0.5);
// 	    //var k2 = Math.floor(estimatorPlot.toDataXCoord(area.x + area.w) + 0.5);
// 	    var xRange = estimatorPlot.xAxisRange();
// 	    var k1 = 0;//Math.floor(xRange[0] + 0.5);
// 	    var k2 = estimator_length;//Math.floor(xRange[1] + 0.5);
// 	    k1 = (k1 >= 0) ? k1 : 0;
// 	    var n = 1;//Math.ceil((k2 - k1) / points_count);
// 	    for (var k = k1; k < k2; k += n)
// 	    {
// 		var val = estimator_data.getFloat32(4*k);
// 	    	plot_array += k + "," + val + "\n";
// 	    }
// 	    plot_array += (estimator_length-1) + "," + estimator_data.getFloat32(4*(estimator_length-1)) + "\n";
// 	    estimatorPlot.updateOptions({file: plot_array});
// 	}
//     	timestamp_str = timestampToHexString(estimator_timestamp);
//     	setTimeout(estimator, 0);
    }
 //    catch(e)
 //    {
 //    	alert(e.name);
 // alert("k1 = "+k1+" ,k2 = "+k2);
 // alert(e.stack);
 // }
 // }

function estimator()
{
    try
    {
    	estimatorHttp = new XMLHttpRequest();
    	var request = estimatorUrl;//+"?timestamp="+timestamp_str;
    	estimatorHttp.open("GET", request, true);
    	estimatorHttp.responseType = "arraybuffer";
    	estimatorHttp.onload = receiveData;
    	estimatorHttp.send(null);
    }
    catch(e)
    {
      console.log("bum")
    	alert(e.name());
    }
}
