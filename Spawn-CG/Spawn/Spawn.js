//Name: Ritesh Thapa

var canvas;
var gl;
var no_of_cubes = 9;

var kft = 0.0;
var stepSize = 0.005;

var NumVertices = 36;

scale = 0.2; //default scale of spaened instances

var cubeVertices = [];
var cubeColor = [];
var clicked = false; // boolean variable that helps with toggling animation

vectors = []; // stores outward path vectices where each component is randomly generated

var mvMatrix;
var mvMatrix2;
var modelView;

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  //
  //  Load shaders and initialize attribute buffers
  //
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  createCube();

  // Last thing to draw - the origin (no transformation applied)
  // push the origin and make it black

  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeColor), gl.STATIC_DRAW);

  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeVertices), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  modelView = gl.getUniformLocation(program, "modelView");

  canvas.addEventListener("mousedown", function () {
    //eventlistener for toggling animation
    clicked = !clicked;
    vectors.length = 0;
    for (i = 0; i < no_of_cubes; i++) {
      //creating outward path vectors where each component is random
      vector = normalize(
        vec3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        )
      );
      vectors.push(vector);
    }
  });

  document.getElementById("slider").onchange = function () {
    //Slider event handler
    scale = event.srcElement.value / 100;
    console.log("scale = ", scale);
  };

  document.getElementById("slider2").onchange = function () {
    //Slider event handler
    stepSize = event.srcElement.value / 10000;
    console.log("speed = ", stepSize);
  };

  render();
};

var vertices = [
  vec3(0.0, 0.0, 0.0),
  vec3(0.0, 1.0, 0.0),
  vec3(1.0, 1.0, 0.0),
  vec3(1.0, 0.0, 0.0),
  vec3(0.0, 0.0, -1.0),
  vec3(0.0, 1.0, -1.0),
  vec3(1.0, 1.0, -1.0),
  vec3(1.0, 0.0, -1.0),
];

var vertexColors = [
  [0.2, 0.4, 0.0, 1.0],
  [0.7, 1.0, 0.4, 1.0],
  [0.6, 0.0, 0.0, 1.0],
  [1.0, 0.6, 0.6, 1.0],
  [0.6, 0.8, 1.0, 1.0],
  [0.0, 0.0, 1.0, 1.0],
  [0.9, 0.9, 0.0, 1.0],
  [0.6, 0.6, 0.0, 1.0],
];

function createCube() {
  quad(1, 0, 3, 2);
  quad(2, 3, 7, 6);
  quad(3, 0, 4, 7);
  quad(6, 5, 1, 2);
  quad(4, 5, 6, 7);
  quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
  // We need to partition the quad into two triangles in order for
  // WebGL to be able to render it.  In this case, we create two
  // triangles from the quad indices

  //vertex color assigned by the index of the vertex

  var indices = [a, b, c, a, c, d];

  console.log("CreateCube: indices = ", indices);

  for (var i = 0; i < indices.length; ++i) {
    cubeVertices.push(vertices[indices[i]]);
    cubeColor.push(vertexColors[a]);
  }
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //mvMatrix for prototype cube 0
  mvMatrix = mat4();
  mvMatrix = translate(-0.5, -0.5, 0);

  gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));
  gl.drawArrays(gl.TRIANGLES, 0, NumVertices);

  // key fram time variable
  // use for interpolation and choreograph action
  if (kft > 1.0) kft = 0.0;

  if (kft < 1) {
    kft = kft + stepSize;
  }

  if (clicked == true) {
    for (i = 0; i < no_of_cubes; i++) {
      //mvMatrix2 for instances
      mvMatrix2 = translate(
        -0.5 * (1.0 - kft) + vectors[i][0] * kft,
        -0.5 * (1.0 - kft) + vectors[i][1] * kft,
        0.5 * (1.0 - kft) + vectors[i][2] * kft
      );

      mvMatrix2 = mult(mvMatrix2, scalem(scale, scale, scale));

      mvMatrix2 = mult(mvMatrix2, rotate(kft * 720, vectors[i]));

      gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix2));
      gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }
  }

  requestAnimFrame(render);
}
