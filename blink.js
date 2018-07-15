// Mimic Me!
// Fun game where you need to express emojis being displayed

// --- Affectiva setup ---

// The affdex SDK Needs to create video and canvas elements in the DOM
var divRoot = $("#camera")[0];  // div node where we want to add these elements
var width = 640, height = 480;  // camera image size
var faceMode = affdex.FaceDetectorMode.LARGE_FACES;  // face mode parameter

// Initialize an Affectiva CameraDetector object
var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

// Enable detection of specific Expressions classifiers.
detector.detectExpressions.eyeClosure=true;

// Set process rate
detector.processFPS = 15

// --- History data and utillities ---
var data = {}  // history data
var cnt_result  // count results returned
var e_prev = null
var e_now  // capture eye status
var e_threshhold = 10  // eyeClosure threshhold
var cnt_blink  // count blinks
var t_prev, t_now // capture refresh interval

function initData() {
  data['attention'] = []
  data['eyeClosure'] = []
  data['timestamp'] = []
  data['interval'] = []
  cnt_result = 0
  cnt_blink = 0
  t_prev = null
}

// load data from LocalStorage
function loadData() {
  if (window.localStorage) {
    var localStorage =window.localStorage;
    for (k in data) {
      data[k] = localStorage.getItem(k);
    }
  }
}


// --- Echarts setup ---

// initialize echarts instance
var myChart = echarts.init($('#results')[0]);

// initialize options
function initChart() {
  myChart.setOption({
      grid: {
        left: 0,
        top: 10,
        right: 0,
        bottom: 5,
        containLabel: true
      },
      xAxis: {
        data: []
      },
      yAxis: {
        splitLine: {
          show: false
        }
      },
      visualMap: {
        show: false,
        pieces: [{
          gte: 0,
          lt: 10,
          color: '#50a3ba'
        }],
        outOfRange: {
          color: '#d94e5d'
        }
      },
      series: [{
        name: 'eyeClosure',
        type: 'line',        
        lineStyle: {
          width: 1
        },
        areaStyle: {
          opacity: 0.5
        },
        data: []
      }]
  });
}

// --- Utility functions ---

// Display log messages and tracking results
function log(node_name, msg) {
  $(node_name).append("<span>" + msg + "</span><br />")
}

// clear previous output
function clearOutput() {
  $("#logs").html("");  
  $('#appearance').html("");
  $('#target').html("?");
  $('#score').html("?");
  initChart();
}

// --- Callback functions ---

// Start button
function onStart() {
  if (detector && !detector.isRunning) {
    clearOutput();  // clear previous output
    initData();
    initChart();
    detector.start();  // start detector 
  }
  log('#logs', "Start button pressed");
}

// Stop button
function onStop() {
  log('#logs', "Stop button pressed");
  if (detector && detector.isRunning) {
    detector.removeEventListener();
    detector.stop();  // stop detector
  }
};

// Reset button
function onReset() {
  log('#logs', "Reset button pressed");
  if (detector && detector.isRunning) {
    detector.reset();
  }
  clearOutput();  // clear previous output
};

// Add a callback to notify when camera access is allowed
detector.addEventListener("onWebcamConnectSuccess", function() {
  log('#logs', "Webcam access allowed");
});

// Add a callback to notify when camera access is denied
detector.addEventListener("onWebcamConnectFailure", function() {
  log('#logs', "webcam denied");
  console.log("Webcam access denied");
});

// Add a callback to notify when detector is stopped
detector.addEventListener("onStopSuccess", function() {
  log('#logs', "The detector reports stopped");
});

// Add a callback to notify when the detector is initialized and ready for running
detector.addEventListener("onInitializeSuccess", function() {
  log('#logs', "The detector reports initialized");
  //Display canvas instead of video feed because we want to draw the feature points on it
  $("#face_video_canvas").css("display", "block");
  $("#face_video").css("display", "none");

  // TODO(optional): Call a function to initialize the game, if needed
  // <your code here>
});

// Add a callback to receive the results from processing an image
// NOTE: The faces object contains a list of the faces detected in the image,
//   probabilities for different expressions, emotions and appearance metrics
detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
  var canvas = $('#face_video_canvas')[0];
  if (!canvas)
    return;

  // Count results
  cnt_result += 1;

  // Time interval
  t_prev = t_now;
  t_now = timestamp;
  interval = t_prev == null ? 0 : t_now - t_prev;
  data['interval'].push(parseInt(interval*1000));

  // Report face metrics
  // $('#results').html("");
  $('#appearance').html("");
  timestamp = timestamp.toFixed(1);
  data['timestamp'].push(timestamp);
  log('#appearance', "Timestamp: " + timestamp);
  log('#appearance', "Total results: " + cnt_result);
  log('#appearance', "Results/sec: " + (cnt_result/timestamp).toFixed(1));
  log('#appearance', "Faces found: " + faces.length);
  if (faces.length > 0) {
    // Report desired metrics
    eyeClosure = parseInt(faces[0].expressions.eyeClosure);
    log('#appearance', "eyeClosure: " + eyeClosure);

    // Mark eye keypoint
    drawEye(canvas, image, faces[0]);

    // Count blinks
    e_prev = e_now;
    e_now = eyeClosure<e_threshhold ? 0 : 1;
    if (t_prev != null && e_prev==1 && e_now==0) {
      cnt_blink += 1;
    }
    $('#target').html(cnt_blink);
    if (cnt_blink>0) {
      $('#score').html((timestamp/cnt_blink).toFixed(1) + ' sec/blink');
    }

    // Add data
    data['eyeClosure'].push(eyeClosure);   
  }
  else {
    // append nan
    data['eyeClosure'].push(NaN);
  }

  // update chart
  myChart.setOption({
    xAxis: {
      data: data.timestamp
    },      
    series: [{
      name: 'eyeClosure',
      data: data.eyeClosure
    }]
  });
});


// --- Custom functions ---

// Draw eye feature points
function drawEye(canvas, img, face) {
  // Obtain a 2D context object to draw on the canvas
  var ctx = canvas.getContext('2d');

  // TODO: Set the stroke and/or fill style you want for each feature point marker
  // See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#Fill_and_stroke_styles
  ctx.strokeStyle="#FFF";
  
  // Loop over each feature point in the face  
  // 16 Outer Right Eye
  // 17 Inner Right Eye
  // 18 Inner Left Eye
  // 19 Outer Left Eye
  // 30 Upper Corner Right Eye
  // 31 Lower Corner Right Eye
  // 32 Upper Corner Left Eye
  // 33 Lower Corner Left Eye
  eyepoints = [16, 17, 18, 19, 30, 31, 32, 33]
  for (var id in eyepoints) {
    var featurePoint = face.featurePoints[eyepoints[id]];

    // TODO: Draw feature point, e.g. as a circle using ctx.arc()
    // See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc
    ctx.beginPath();
    ctx.arc(featurePoint['x'],featurePoint['y'],2,0,2*Math.PI);
    ctx.stroke();
  }
}
