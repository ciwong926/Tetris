/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
var defaultEye = vec3.fromValues(0.5,0.5,-0.5); // default eye position in world space
var defaultCenter = vec3.fromValues(0.5,0.5,0.5); // default view direction in world space
var defaultUp = vec3.fromValues(0,1,0); // default view up vector
var lightDiffuse = vec3.fromValues(1,1,1); // default light diffuse emission
var lightPosition = vec3.fromValues(-0.5,1.5,-2.5); // default light position
var rotateTheta = Math.PI/50; // how much to rotate models by with each key press

/* webgl and geometry data */
var gl = null; // the all powerful gl object. It's all here folks!
var inputTriangles = []; // the triangle data as loaded from input files
var numTriangleSets = 0; // how many triangle sets in input scene
var inputEllipsoids = []; // the ellipsoid data as loaded from input files
var numEllipsoids = 0; // how many ellipsoids in the input scene
var vertexBuffers = []; // this contains vertex coordinate lists by set, in triples
var triSetSizes = []; // this contains the size of each triangle set
var triangleBuffers = []; // lists of indices into vertexBuffers by set, in triples
var viewDelta = 0; // how much to displace view with each key press

var positionBufferA = [];
var indexBufferA = [];

var positionBufferB = [];
var indexBufferB = [];

var positionBufferC = [];
var indexBufferC = [];

var positionBufferD = [];
var indexBufferD = [];

var positionBufferE = [];
var indexBufferE = [];

/* shader parameter locations */
var vPosAttribLoc; // where to put position for vertex shader
var mMatrixULoc; // where to put model matrix for vertex shader
var pvmMatrixULoc; // where to put project model view matrix for vertex shader
var diffuseULoc; // where to put diffuse reflecivity for fragment shader

var transpULoc;
var xTransULoc;
var yTransULoc;
var zTransULoc;

var round = 0;

var peicesA = 40;
var xmoveA = [];
var ymoveA = [];
var zmoveA = [];

var peicesB = 40;
var xmoveB = [];
var ymoveB = [];
var zmoveB = [];

var peicesC = 40;
var xmoveC = [];
var ymoveC = [];
var zmoveC = [];

var peicesD = 40;
var xmoveD = [];
var ymoveD = [];
var zmoveD = [];

var peicesE = 40;
var xmoveE = [];
var ymoveE = [];
var zmoveE = [];

var bottomA = 0;
var bottomB = 0;
var bottomC = 0;
var bottomD = 0;
var bottomE = 0;

var taken = [];
var active = [];
var done;
var ultimateDone;

/* Render Data - Set In Load Models (Grid / Back Of Playing Feild) */
var colorArray = [];
var xAxisArray = [];
var yAxisArray = [];
var centerArray = [];
var transArray = [];

/* Vertices, Normals, Triangles (Grid / Back Wall of Playing Feild) */
var gridVertexArray = [];
var gridTriArray = [];

/* Bottom Playing Feild (Establishes Depth) */

/* Top Playing Feild (Establishes Depth) */

/* interaction variables */
var Eye = vec3.clone(defaultEye); // eye position in world space
var Center = vec3.clone(defaultCenter); // view direction in world space
var Up = vec3.clone(defaultUp); // view up vector in world space

// ASSIGNMENT HELPER FUNCTIONS

// does stuff when keys are pressed
function handleKeyDown(event) {
    
    // const modelEnum = {TRIANGLES: "triangles", ELLIPSOID: "ellipsoid"}; // enumerated model type
    const dirEnum = {NEGATIVE: -1, POSITIVE: 1}; // enumerated rotation direction
    const modelEnum = {TRIANGLES: "triangles"};
    
    // set up needed view params
    var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt,vec3.subtract(temp,Center,Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,Up)); // get view right vector
    
    // highlight static variables
    handleKeyDown.whichOn = handleKeyDown.whichOn == undefined ? -1 : handleKeyDown.whichOn; // nothing selected initially
    handleKeyDown.modelOn = handleKeyDown.modelOn == undefined ? null : handleKeyDown.modelOn; // nothing selected initially

    switch (event.code) {

        // interactivity
        case "ArrowLeft":
            if (done == false && ultimateDone == false) {
                moveLeft();
            }
            break;

        case "ArrowRight":
            if (done == false && ultimateDone == false) {
                moveRight();
            }
            break;

        case "ArrowDown":
            if (done == false && ultimateDone == false) {
                moveDown();
            }
            break;
        case "Space":
            if (done == false && ultimateDone == false) {
                skipDown();
            }
            break;
                    
        // view change
        case "KeyA": // translate view left, rotate left with shift
            Center = vec3.add(Center,Center,vec3.scale(temp,viewRight,viewDelta));
            if (!event.getModifierState("Shift"))
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,viewRight,viewDelta));
            break;
        case "KeyD": // translate view right, rotate right with shift
            Center = vec3.add(Center,Center,vec3.scale(temp,viewRight,-viewDelta));
            if (!event.getModifierState("Shift"))
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,viewRight,-viewDelta));
            break;
        case "KeyS": // translate view backward, rotate up with shift
            if (event.getModifierState("Shift")) {
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,viewDelta));
                Up = vec3.cross(Up,viewRight,vec3.subtract(lookAt,Center,Eye)); /* global side effect */
            } else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,lookAt,-viewDelta));
                Center = vec3.add(Center,Center,vec3.scale(temp,lookAt,-viewDelta));
            } // end if shift not pressed
            break;
        case "KeyW": // translate view forward, rotate down with shift
            if (event.getModifierState("Shift")) {
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,-viewDelta));
                Up = vec3.cross(Up,viewRight,vec3.subtract(lookAt,Center,Eye)); /* global side effect */
            } else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,lookAt,viewDelta));
                Center = vec3.add(Center,Center,vec3.scale(temp,lookAt,viewDelta));
            } // end if shift not pressed
            break;
        case "KeyQ": // translate view up, rotate counterclockwise with shift
            if (event.getModifierState("Shift"))
                Up = vec3.normalize(Up,vec3.add(Up,Up,vec3.scale(temp,viewRight,-viewDelta)));
            else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,Up,viewDelta));
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,viewDelta));
            } // end if shift not pressed
            break;
        case "KeyE": // translate view down, rotate clockwise with shift
            if (event.getModifierState("Shift"))
                Up = vec3.normalize(Up,vec3.add(Up,Up,vec3.scale(temp,viewRight,viewDelta)));
            else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,Up,-viewDelta));
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,-viewDelta));
            } // end if shift not pressed
            break;
        case "Escape": // reset view to default
            Eye = vec3.copy(Eye,defaultEye);
            Center = vec3.copy(Center,defaultCenter);
            Up = vec3.copy(Up,defaultUp);
            break;
            
    } // end switchW
} // end handleKeyDown

// set up the webGL environment
function setupWebGL() {
    
    // Set up keys
    document.onkeydown = handleKeyDown; // call this when key pressed
     
    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it
    
    try {
      if (gl == null) {
        throw "unable to create gl context -- is your browser gl ready?";
      } else {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
        gl.clearDepth(1.0); // use max when we clear the depth buffer
        gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
      }
    } // end try
    
    catch(e) {
      console.log(e);
    } // end catch
 
} // end setupWebGL

// read models in, load them into webgl buffers.
function loadGrid() {

    // Establishing View Delta
    var maxCorner = vec3.fromValues(0.01,-0.49,0.75); // bbox corner
    var minCorner = vec3.fromValues(0.99,1.49,0.85); // other corner
    var temp = vec3.create();
    viewDelta = vec3.length(vec3.subtract(temp,maxCorner,minCorner)) / 100; // set globalQ

    var triangles = [[0,1,2],[2,3,0]];
    var gridColor = [0.4,0.4,0.4];
    
    var y1 = 1.4; // min y
    var y2 = 1.5; // max y
    var lineThick = 0.005;

    var rows = 20;
    var cols = 10;

    numTriangleSets = rows * cols; // remember how many tri sets

    // For Each Set ...
    for (var rowNum =  0; rowNum < rows; rowNum++) {

        var x1 = 0.9; // min x
        var x2 = 1.0; // max x

        for (var colNum = 0; colNum < cols; colNum++) {

            var setNum = (rowNum * cols) + colNum;

            // Storing Centers, Translations, Axis 
            centerArray[setNum] = vec3.fromValues(0,0,0);
            transArray[setNum] = vec3.fromValues(0,0,0);
            xAxisArray[setNum] = vec3.fromValues(1,0,0);
            yAxisArray[setNum] = vec3.fromValues(0,1,0);

            // Color 
            colorArray[setNum] = gridColor;

            // Tris
            gridTriArray[setNum] = triangles;

            var vertices = [[x1 + lineThick, y1 + lineThick, 0.75], [x1 + lineThick, y2 - lineThick, 0.75], 
            [x2 - lineThick, y2 - lineThick, 0.75], [x2 - lineThick, y1 + lineThick, 0.75]];

            gridVertexArray[setNum] = vertices; 

            x1 = x1 - 0.1;
            x2 = x2 - 0.1;
        }

        y1 = y1 - 0.1;
        y2 = y2 - 0.1;
    }

    // Set Helper Variables
    var whichSetVert; // index of vertex in current triangle set
    var whichSetTri; // index of triangle in current triangle set
    var vtxToAdd; // vtx coords to add to the coord array
    var normToAdd; // vtx normal to add to the coord array
    var triToAdd; // tri indices to add to the index array
        
    // process each triangle set to load webgl vertex and triangle buffers
    for (var whichSet=0; whichSet<numTriangleSets; whichSet++) { // for each tri set

        // set up the vertex and normal arrays, define model center and axes
        var glVertices = []; // flat coord list for webgl

        var numVerts = gridVertexArray[whichSet].length; // num vertices in tri set

        for (whichSetVert=0; whichSetVert<numVerts; whichSetVert++) { // verts in set

            vtxToAdd = gridVertexArray[whichSet][whichSetVert]; // get vertex to add

            glVertices.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]); // put coords in set coord list

        } // end for vertices in set

        vec3.scale(centerArray[whichSet],centerArray[whichSet],1/numVerts); // avg ctr sum

        // send the vertex coords and normals to webGL
        vertexBuffers[whichSet] = gl.createBuffer(); // init empty webgl set vertex coord buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichSet]); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(glVertices),gl.STATIC_DRAW); // data in
            
        // set up the triangle index array, adjusting indices across sets
        var glTriangles = []; // flat index list for webgl

        triSetSizes[whichSet] = gridTriArray[whichSet].length; // number of tris in this set

        for (whichSetTri=0; whichSetTri<triSetSizes[whichSet]; whichSetTri++) {
            triToAdd = gridTriArray[whichSet][whichSetTri]; // get tri to add
            glTriangles.push(triToAdd[0],triToAdd[1],triToAdd[2]); // put indices in set list
        } // end for triangles in set

        // send the triangle indices to webGL
        triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(glTriangles),gl.STATIC_DRAW); // data in

    } // end for each triangle set 


} // end load models

// Reffered to the following tutorial to assist in cube making:
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL
function loadPeicesA() {

    var  x1 =  0.9;
    var  x2 =  1.0;
    var  y1 =  1.4;
    var  y2 =  1.5;
    // var  z1 =  0.65;
    // var  z2 =  0.75;
    var  z1 =  19.9;
    var  z2 =  20.0;
    var positions  = [];

    positions[0] = [
        // Front face
        x1,  y1,  z2,
        x2,  y1,  z2,
        x2,  y2,  z2,
        x1,  y2,  z2,
  
        // Back face
        x1,  y1,  z1,
        x1,  y2,  z1,
        x2,  y2,  z1,
        x2,  y1,  z1,
  
        // Top face
        x1,  y2,  z1,
        x1,  y2,  z2,
        x2,  y2,  z2,
        x2,  y2,  z1,
  
        // Bottom face
        x1,  y1,  z1,
        x2,  y1,  z1,
        x2,  y1,  z2,
        x1,  y1,  z2,
  
        // Right face
        x2,  y1,  z1,
        x2,  y2,  z1,
        x2,  y2,  z2,
        x2,  y1,  z2,
  
        // Left face
        x1,  y1,  z1,
        x1,  y1,  z2,
        x1,  y2,  z2,
        x1,  y2,  z1,
    ];

    var pos1tx = -0.100;
    positions[1] = [
        // Front face
        x1 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z2,
  
        // Back face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y1,  z1,
  
        // Top face
        x1 + pos1tx,  y2,  z1,
        x1 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z1,
  
        // Bottom face
        x1 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y1,  z2,
  
        // Right face
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y1,  z2,
  
        // Left face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z1,
    ];

    var pos2tx = pos1tx*2;
    positions[2] = [
        // Front face
        x1 + pos2tx,  y1,  z2,
        x2 + pos2tx,  y1,  z2,
        x2 + pos2tx,  y2,  z2,
        x1 + pos2tx,  y2,  z2,
  
        // Back face
        x1 + pos2tx,  y1,  z1,
        x1 + pos2tx,  y2,  z1,
        x2 + pos2tx,  y2,  z1,
        x2 + pos2tx,  y1,  z1,
  
        // Top face
        x1 + pos2tx,  y2,  z1,
        x1 + pos2tx,  y2,  z2,
        x2 + pos2tx,  y2,  z2,
        x2 + pos2tx,  y2,  z1,
  
        // Bottom face
        x1 + pos2tx,  y1,  z1,
        x2 + pos2tx,  y1,  z1,
        x2 + pos2tx,  y1,  z2,
        x1 + pos2tx,  y1,  z2,
  
        // Right face
        x2 + pos2tx,  y1,  z1,
        x2 + pos2tx,  y2,  z1,
        x2 + pos2tx,  y2,  z2,
        x2 + pos2tx,  y1,  z2,
  
        // Left face
        x1 + pos2tx,  y1,  z1,
        x1 + pos2tx,  y1,  z2,
        x1 + pos2tx,  y2,  z2,
        x1 + pos2tx,  y2,  z1,
    ];

    var pos3ty = -0.100; 
    positions[3] = [

        x1 + pos1tx,  y1 + pos3ty,  z2,
        x2 + pos1tx,  y1 + pos3ty,  z2,
        x2 + pos1tx,  y2 + pos3ty,  z2,
        x1 + pos1tx,  y2 + pos3ty,  z2,
  
        // Back face
        x1 + pos1tx,  y1 + pos3ty,  z1,
        x1 + pos1tx,  y2 + pos3ty,  z1,
        x2 + pos1tx,  y2 + pos3ty,  z1,
        x2 + pos1tx,  y1 + pos3ty,  z1,
  
        // Top face
        x1 + pos1tx,  y2 + pos3ty,  z1,
        x1 + pos1tx,  y2 + pos3ty,  z2,
        x2 + pos1tx,  y2 + pos3ty,  z2,
        x2 + pos1tx,  y2 + pos3ty,  z1,
  
        // Bottom face
        x1 + pos1tx,  y1 + pos3ty,  z1,
        x2 + pos1tx,  y1 + pos3ty,  z1,
        x2 + pos1tx,  y1 + pos3ty,  z2,
        x1 + pos1tx,  y1 + pos3ty,  z2,
  
        // Right face
        x2 + pos1tx,  y1 + pos3ty,  z1,
        x2 + pos1tx,  y2 + pos3ty,  z1,
        x2 + pos1tx,  y2 + pos3ty,  z2,
        x2 + pos1tx,  y1 + pos3ty,  z2,
  
        // Left face
        x1 + pos1tx,  y1 + pos3ty,  z1,
        x1 + pos1tx,  y1 + pos3ty,  z2,
        x1 + pos1tx,  y2 + pos3ty,  z2,
        x1 + pos1tx,  y2 + pos3ty,  z1,

    ];

    var count = 0;
    for (var j = 0; j < peicesA; j++) {

        positionBufferA[j] = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferA[j]);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions[count]), gl.STATIC_DRAW);

        if  (count != 3) {
            count++;
        } else {
            count = 0;
        }

    }


    const indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
    ];

    // Now send the element array to GL

    for (var i = 0; i < peicesA; i++) {

        zmoveA[i] = 0.0;
        xmoveA[i] = 0.0;
        ymoveA[i] = 0.0;

        indexBufferA[i] = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferA[i]);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), gl.STATIC_DRAW);
    }

    bottomA = 0;

} // end load peices A

// Reffered to the following tutorial to assist in cube making:
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL
function loadPeicesB() {

    var  x1 =  0.9;
    var  x2 =  1.0;
    var  y1 =  1.4;
    var  y2 =  1.5;
    // var  z1 =  0.65;
    // var  z2 =  0.75;
    var  z1 =  19.9;
    var  z2 =  20.0;
    var positions  = [];

    positions[0] = [
        // Front face
        x1,  y1,  z2,
        x2,  y1,  z2,
        x2,  y2,  z2,
        x1,  y2,  z2,
  
        // Back face
        x1,  y1,  z1,
        x1,  y2,  z1,
        x2,  y2,  z1,
        x2,  y1,  z1,
  
        // Top face
        x1,  y2,  z1,
        x1,  y2,  z2,
        x2,  y2,  z2,
        x2,  y2,  z1,
  
        // Bottom face
        x1,  y1,  z1,
        x2,  y1,  z1,
        x2,  y1,  z2,
        x1,  y1,  z2,
  
        // Right face
        x2,  y1,  z1,
        x2,  y2,  z1,
        x2,  y2,  z2,
        x2,  y1,  z2,
  
        // Left face
        x1,  y1,  z1,
        x1,  y1,  z2,
        x1,  y2,  z2,
        x1,  y2,  z1,
    ];

    var pos1tx = -0.100;
    positions[1] = [
        // Front face
        x1 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z2,
  
        // Back face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y1,  z1,
  
        // Top face
        x1 + pos1tx,  y2,  z1,
        x1 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z1,
  
        // Bottom face
        x1 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y1,  z2,
  
        // Right face
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y1,  z2,
  
        // Left face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z1,
    ];

    var pos2tx = pos1tx*2;
    positions[2] = [
        // Front face
        x1 + pos2tx,  y1,  z2,
        x2 + pos2tx,  y1,  z2,
        x2 + pos2tx,  y2,  z2,
        x1 + pos2tx,  y2,  z2,
  
        // Back face
        x1 + pos2tx,  y1,  z1,
        x1 + pos2tx,  y2,  z1,
        x2 + pos2tx,  y2,  z1,
        x2 + pos2tx,  y1,  z1,
  
        // Top face
        x1 + pos2tx,  y2,  z1,
        x1 + pos2tx,  y2,  z2,
        x2 + pos2tx,  y2,  z2,
        x2 + pos2tx,  y2,  z1,
  
        // Bottom face
        x1 + pos2tx,  y1,  z1,
        x2 + pos2tx,  y1,  z1,
        x2 + pos2tx,  y1,  z2,
        x1 + pos2tx,  y1,  z2,
  
        // Right face
        x2 + pos2tx,  y1,  z1,
        x2 + pos2tx,  y2,  z1,
        x2 + pos2tx,  y2,  z2,
        x2 + pos2tx,  y1,  z2,
  
        // Left face
        x1 + pos2tx,  y1,  z1,
        x1 + pos2tx,  y1,  z2,
        x1 + pos2tx,  y2,  z2,
        x1 + pos2tx,  y2,  z1,
    ];

    var pos3ty = -0.100; 
    positions[3] = [

        x1,  y1 + pos3ty,  z2,
        x2,  y1 + pos3ty,  z2,
        x2,  y2 + pos3ty,  z2,
        x1,  y2 + pos3ty,  z2,
  
        // Back face
        x1,  y1 + pos3ty,  z1,
        x1,  y2 + pos3ty,  z1,
        x2,  y2 + pos3ty,  z1,
        x2,  y1 + pos3ty,  z1,
  
        // Top face
        x1,  y2 + pos3ty,  z1,
        x1,  y2 + pos3ty,  z2,
        x2,  y2 + pos3ty,  z2,
        x2,  y2 + pos3ty,  z1,
  
        // Bottom face
        x1,  y1 + pos3ty,  z1,
        x2,  y1 + pos3ty,  z1,
        x2,  y1 + pos3ty,  z2,
        x1,  y1 + pos3ty,  z2,
  
        // Right face
        x2,  y1 + pos3ty,  z1,
        x2,  y2 + pos3ty,  z1,
        x2,  y2 + pos3ty,  z2,
        x2,  y1 + pos3ty,  z2,
  
        // Left face
        x1,  y1 + pos3ty,  z1,
        x1,  y1 + pos3ty,  z2,
        x1,  y2 + pos3ty,  z2,
        x1,  y2 + pos3ty,  z1,

    ];

    var count = 0;
    for (var j = 0; j < peicesB; j++) {

        positionBufferB[j] = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferB[j]);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions[count]), gl.STATIC_DRAW);

        if  (count != 3) {
            count++;
        } else {
            count = 0;
        }

    }


    const indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
    ];

    // Now send the element array to GL

    for (var i = 0; i < peicesA; i++) {

        zmoveB[i] = 0.0;
        xmoveB[i] = 0.0;
        ymoveB[i] = 0.0;

        indexBufferB[i] = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferB[i]);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), gl.STATIC_DRAW);
    }

    bottomB = 0;

} // end load peices B

function loadPeicesC() {

    var  x1 =  0.9;
    var  x2 =  1.0;
    var  y1 =  1.4;
    var  y2 =  1.5;
    // var  z1 =  0.65;
    // var  z2 =  0.75;
    var  z1 =  19.9;
    var  z2 =  20.0;
    var positions  = [];

    positions[0] = [
        // Front face
        x1,  y1,  z2,
        x2,  y1,  z2,
        x2,  y2,  z2,
        x1,  y2,  z2,
  
        // Back face
        x1,  y1,  z1,
        x1,  y2,  z1,
        x2,  y2,  z1,
        x2,  y1,  z1,
  
        // Top face
        x1,  y2,  z1,
        x1,  y2,  z2,
        x2,  y2,  z2,
        x2,  y2,  z1,
  
        // Bottom face
        x1,  y1,  z1,
        x2,  y1,  z1,
        x2,  y1,  z2,
        x1,  y1,  z2,
  
        // Right face
        x2,  y1,  z1,
        x2,  y2,  z1,
        x2,  y2,  z2,
        x2,  y1,  z2,
  
        // Left face
        x1,  y1,  z1,
        x1,  y1,  z2,
        x1,  y2,  z2,
        x1,  y2,  z1,
    ];

    var pos1tx = -0.100;
    positions[1] = [
        // Front face
        x1 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z2,
  
        // Back face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y1,  z1,
  
        // Top face
        x1 + pos1tx,  y2,  z1,
        x1 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z1,
  
        // Bottom face
        x1 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y1,  z2,
  
        // Right face
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y1,  z2,
  
        // Left face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z1,
    ];

    var pos3ty = -0.100; 

    positions[2] = [
        // Front face
        x1,  y1 + pos3ty,  z2,
        x2,  y1 + pos3ty,  z2,
        x2,  y2 + pos3ty,  z2,
        x1,  y2 + pos3ty,  z2,
  
        // Back face
        x1,  y1 + pos3ty,  z1,
        x1,  y2 + pos3ty,  z1,
        x2,  y2 + pos3ty,  z1,
        x2,  y1 + pos3ty,  z1,
  
        // Top face
        x1,  y2 + pos3ty,  z1,
        x1,  y2 + pos3ty,  z2,
        x2,  y2 + pos3ty,  z2,
        x2,  y2 + pos3ty,  z1,
  
        // Bottom face
        x1,  y1 + pos3ty,  z1,
        x2,  y1 + pos3ty,  z1,
        x2,  y1 + pos3ty,  z2,
        x1,  y1 + pos3ty,  z2,
  
        // Right face
        x2,  y1 + pos3ty,  z1,
        x2,  y2 + pos3ty,  z1,
        x2,  y2 + pos3ty,  z2,
        x2,  y1 + pos3ty,  z2,
  
        // Left face
        x1,  y1 + pos3ty,  z1,
        x1,  y1 + pos3ty,  z2,
        x1,  y2 + pos3ty,  z2,
        x1,  y2 + pos3ty,  z1,
    ];

    positions[3] = [

        x1 + pos1tx,  y1 + pos3ty,  z2,
        x2 + pos1tx,  y1 + pos3ty,  z2,
        x2 + pos1tx,  y2 + pos3ty,  z2,
        x1 + pos1tx,  y2 + pos3ty,  z2,
  
        // Back face
        x1 + pos1tx,  y1 + pos3ty,  z1,
        x1 + pos1tx,  y2 + pos3ty,  z1,
        x2 + pos1tx,  y2 + pos3ty,  z1,
        x2 + pos1tx,  y1 + pos3ty,  z1,
  
        // Top face
        x1 + pos1tx,  y2 + pos3ty,  z1,
        x1 + pos1tx,  y2 + pos3ty,  z2,
        x2 + pos1tx,  y2 + pos3ty,  z2,
        x2 + pos1tx,  y2 + pos3ty,  z1,
  
        // Bottom face
        x1 + pos1tx,  y1 + pos3ty,  z1,
        x2 + pos1tx,  y1 + pos3ty,  z1,
        x2 + pos1tx,  y1 + pos3ty,  z2,
        x1 + pos1tx,  y1 + pos3ty,  z2,
  
        // Right face
        x2 + pos1tx,  y1 + pos3ty,  z1,
        x2 + pos1tx,  y2 + pos3ty,  z1,
        x2 + pos1tx,  y2 + pos3ty,  z2,
        x2 + pos1tx,  y1 + pos3ty,  z2,
  
        // Left face
        x1 + pos1tx,  y1 + pos3ty,  z1,
        x1 + pos1tx,  y1 + pos3ty,  z2,
        x1 + pos1tx,  y2 + pos3ty,  z2,
        x1 + pos1tx,  y2 + pos3ty,  z1,

    ];

    var count = 0;
    for (var j = 0; j < peicesC; j++) {

        positionBufferC[j] = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferC[j]);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions[count]), gl.STATIC_DRAW);

        if  (count != 3) {
            count++;
        } else {
            count = 0;
        }

    }


    const indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
    ];

    // Now send the element array to GL

    for (var i = 0; i < peicesC; i++) {

        zmoveC[i] = 0.0;
        xmoveC[i] = 0.0;
        ymoveC[i] = 0.0;

        indexBufferC[i] = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferC[i]);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
           new Uint16Array(indices), gl.STATIC_DRAW);
    }


    bottomC = 0;

} // end load peices C

function loadPeicesD() {

    var  x1 =  0.9;
    var  x2 =  1.0;
    var  y1 =  1.4;
    var  y2 =  1.5;
    // var  z1 =  0.65;
    // var  z2 =  0.75;
    var  z1 =  19.9;
    var  z2 =  20.0;
    var positions  = [];

    var pos1tx = -0.100;

    positions[0] = [

        // Front face
        x1 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z2,
  
        // Back face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y1,  z1,
  
        // Top face
        x1 + pos1tx,  y2,  z1,
        x1 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z1,
  
        // Bottom face
        x1 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y1,  z2,
  
        // Right face
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y1,  z2,
  
        // Left face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z1,
    ];

    pos1tx += -0.100;
    positions[1] = [
        // Front face
        x1 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z2,
  
        // Back face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y1,  z1,
  
        // Top face
        x1 + pos1tx,  y2,  z1,
        x1 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z1,
  
        // Bottom face
        x1 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y1,  z2,
  
        // Right face
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y1,  z2,
  
        // Left face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z1,
    ];

    var pos3ty = -0.100; 

    positions[2] = [
        // Front face
        x1,  y1 + pos3ty,  z2,
        x2,  y1 + pos3ty,  z2,
        x2,  y2 + pos3ty,  z2,
        x1,  y2 + pos3ty,  z2,
  
        // Back face
        x1,  y1 + pos3ty,  z1,
        x1,  y2 + pos3ty,  z1,
        x2,  y2 + pos3ty,  z1,
        x2,  y1 + pos3ty,  z1,
  
        // Top face
        x1,  y2 + pos3ty,  z1,
        x1,  y2 + pos3ty,  z2,
        x2,  y2 + pos3ty,  z2,
        x2,  y2 + pos3ty,  z1,
  
        // Bottom face
        x1,  y1 + pos3ty,  z1,
        x2,  y1 + pos3ty,  z1,
        x2,  y1 + pos3ty,  z2,
        x1,  y1 + pos3ty,  z2,
  
        // Right face
        x2,  y1 + pos3ty,  z1,
        x2,  y2 + pos3ty,  z1,
        x2,  y2 + pos3ty,  z2,
        x2,  y1 + pos3ty,  z2,
  
        // Left face
        x1,  y1 + pos3ty,  z1,
        x1,  y1 + pos3ty,  z2,
        x1,  y2 + pos3ty,  z2,
        x1,  y2 + pos3ty,  z1,
    ];

    pos1tx -= -0.100;
    positions[3] = [

        x1 + pos1tx,  y1 + pos3ty,  z2,
        x2 + pos1tx,  y1 + pos3ty,  z2,
        x2 + pos1tx,  y2 + pos3ty,  z2,
        x1 + pos1tx,  y2 + pos3ty,  z2,
  
        // Back face
        x1 + pos1tx,  y1 + pos3ty,  z1,
        x1 + pos1tx,  y2 + pos3ty,  z1,
        x2 + pos1tx,  y2 + pos3ty,  z1,
        x2 + pos1tx,  y1 + pos3ty,  z1,
  
        // Top face
        x1 + pos1tx,  y2 + pos3ty,  z1,
        x1 + pos1tx,  y2 + pos3ty,  z2,
        x2 + pos1tx,  y2 + pos3ty,  z2,
        x2 + pos1tx,  y2 + pos3ty,  z1,
  
        // Bottom face
        x1 + pos1tx,  y1 + pos3ty,  z1,
        x2 + pos1tx,  y1 + pos3ty,  z1,
        x2 + pos1tx,  y1 + pos3ty,  z2,
        x1 + pos1tx,  y1 + pos3ty,  z2,
  
        // Right face
        x2 + pos1tx,  y1 + pos3ty,  z1,
        x2 + pos1tx,  y2 + pos3ty,  z1,
        x2 + pos1tx,  y2 + pos3ty,  z2,
        x2 + pos1tx,  y1 + pos3ty,  z2,
  
        // Left face
        x1 + pos1tx,  y1 + pos3ty,  z1,
        x1 + pos1tx,  y1 + pos3ty,  z2,
        x1 + pos1tx,  y2 + pos3ty,  z2,
        x1 + pos1tx,  y2 + pos3ty,  z1,

    ];

    var count = 0;
    for (var j = 0; j < peicesD; j++) {

        positionBufferD[j] = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferD[j]);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions[count]), gl.STATIC_DRAW);

        if  (count != 3) {
            count++;
        } else {
            count = 0;
        }

    }


    const indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
    ];

    // Now send the element array to GL

    for (var i = 0; i < peicesD; i++) {

        zmoveD[i] = 0.0;
        xmoveD[i] = 0.0;
        ymoveD[i] = 0.0;

        indexBufferD[i] = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferD[i]);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), gl.STATIC_DRAW);
    }

    bottomD = 0;


} // end load peices D

function loadPeicesE() {

    var  x1 =  0.9;
    var  x2 =  1.0;
    var  y1 =  1.4;
    var  y2 =  1.5;
    // var  z1 =  0.65;
    // var  z2 =  0.75;
    var  z1 =  19.9;
    var  z2 =  20.0;
    var positions  = [];

    var pos1tx = 0.0;

    positions[0] = [

        // Front face
        x1 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z2,
  
        // Back face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y1,  z1,
  
        // Top face
        x1 + pos1tx,  y2,  z1,
        x1 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z1,
  
        // Bottom face
        x1 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y1,  z2,
  
        // Right face
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y1,  z2,
  
        // Left face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z1,
    ];

    pos1tx += -0.100;
    positions[1] = [
        // Front face
        x1 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z2,
  
        // Back face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y1,  z1,
  
        // Top face
        x1 + pos1tx,  y2,  z1,
        x1 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z1,
  
        // Bottom face
        x1 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y1,  z2,
  
        // Right face
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y1,  z2,
  
        // Left face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z1,
    ];

    pos1tx += -0.100;
    positions[2] = [
        // Front face
        x1 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z2,
  
        // Back face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y1,  z1,
  
        // Top face
        x1 + pos1tx,  y2,  z1,
        x1 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z1,
  
        // Bottom face
        x1 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y1,  z2,
  
        // Right face
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y1,  z2,
  
        // Left face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z1,
    ];

    pos1tx += -0.100;
    positions[3] = [

        // Front face
        x1 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y1,  z2,
        x2 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z2,
  
        // Back face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y1,  z1,
  
        // Top face
        x1 + pos1tx,  y2,  z1,
        x1 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y2,  z1,
  
        // Bottom face
        x1 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y1,  z2,
  
        // Right face
        x2 + pos1tx,  y1,  z1,
        x2 + pos1tx,  y2,  z1,
        x2 + pos1tx,  y2,  z2,
        x2 + pos1tx,  y1,  z2,
  
        // Left face
        x1 + pos1tx,  y1,  z1,
        x1 + pos1tx,  y1,  z2,
        x1 + pos1tx,  y2,  z2,
        x1 + pos1tx,  y2,  z1,

    ];

    var count = 0;
    for (var j = 0; j < peicesE; j++) {

        positionBufferE[j] = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferE[j]);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions[count]), gl.STATIC_DRAW);

        if  (count != 3) {
            count++;
        } else {
            count = 0;
        }

    }


    const indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
    ];

    // Now send the element array to GL

    for (var i = 0; i < peicesE; i++) {

        zmoveE[i] = 0.0;
        xmoveE[i] = 0.0;
        ymoveE[i] = 0.0;

        indexBufferE[i] = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferE[i]);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), gl.STATIC_DRAW);
    }

    bottomE = 0;


} // end load peices E

function setActive() {
    for (var i  = 0; i < 10; i++) {
        active.push(1, i);
        active.push(2, i);
        active.push(3, i);
        active.push(4, i);
        active.push(5, i);
    }
    done=false;
}

function setTaken() {
    for (var i  = 0; i < 200; i++) {
        taken.push(0);
    }
}

// setup the webGL shaders
function setupShaders() {
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 aVertexPosition; // vertex position
        
        uniform mat4 umMatrix; // the model matrix
        uniform mat4 upvmMatrix; // the project view model matrix

        uniform float xtranslate;
        uniform float ytranslate;
        uniform float ztranslate;
        
        varying vec3 vWorldPos; // interpolated world position of vertex

        void main(void) {
        
            vec4 vWorldPos4 = umMatrix * vec4(aVertexPosition, 1.0);
            vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
            gl_Position = upvmMatrix * vec4(aVertexPosition[0] + xtranslate, aVertexPosition[1] + ytranslate, aVertexPosition[2] + ztranslate, 1.0);
        }
    `;
    
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float; // set float to medium precision

        // eye location
        uniform vec3 uEyePosition; // the eye's position in world
        
        // light properties
        uniform vec3 uLightDiffuse; // the light's diffuse color
        uniform vec3 uLightPosition; // the light's position
        
        // material properties
        uniform vec3 uDiffuse; // the diffuse reflectivity

        // transparency
        uniform float uTransp;
        
        // geometry properties
        varying vec3 vWorldPos; // world xyz of fragment
            
        void main(void) {
            
            vec3  diffuse = uDiffuse*uLightDiffuse;
            
            vec3 colorOut = diffuse;
            gl_FragColor = vec4(colorOut, uTransp); 
        }
    `;
    
    try {
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            var shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                
                // locate and enable vertex attributes
                vPosAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // ptr to vertex pos attrib
                gl.enableVertexAttribArray(vPosAttribLoc); // connect attrib to array
                
                // locate vertex uniforms
                mMatrixULoc = gl.getUniformLocation(shaderProgram, "umMatrix"); // ptr to mmat
                pvmMatrixULoc = gl.getUniformLocation(shaderProgram, "upvmMatrix"); // ptr to pvmmat
                
                // locate fragment uniforms
                var eyePositionULoc = gl.getUniformLocation(shaderProgram, "uEyePosition"); // ptr to eye position
                var lightDiffuseULoc = gl.getUniformLocation(shaderProgram, "uLightDiffuse"); // ptr to light diffuse
                var lightPositionULoc = gl.getUniformLocation(shaderProgram, "uLightPosition"); // ptr to light position
                diffuseULoc = gl.getUniformLocation(shaderProgram, "uDiffuse"); // ptr to diffuse
                transpULoc = gl.getUniformLocation(shaderProgram, "uTransp"); 
                xTransULoc = gl.getUniformLocation(shaderProgram, "xtranslate"); 
                yTransULoc = gl.getUniformLocation(shaderProgram, "ytranslate"); 
                zTransULoc = gl.getUniformLocation(shaderProgram, "ztranslate"); 
                
                // pass global constants into fragment uniforms
                gl.uniform3fv(eyePositionULoc,Eye); // pass in the eye's position
                gl.uniform3fv(lightDiffuseULoc,lightDiffuse); // pass in the light's diffuse emission
                gl.uniform3fv(lightPositionULoc,lightPosition); // pass in the light's position
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

function renderPeicesA() {

    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    const vertexCount = 36;
    const type2 = gl.UNSIGNED_SHORT;
    const offset2 = 0;

    for (var i = 0; i < peicesA; i++) {
        
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferA[i]);
        gl.vertexAttribPointer(
            vPosAttribLoc,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            vPosAttribLoc);

        var peicesAColor = [1,0.835294,0];
        // reflectivity: feed to the fragment shader
        gl.uniform3fv(diffuseULoc, peicesAColor); // pass in the diffuse reflectivity
        gl.uniform1f(transpULoc, 1.0);
        gl.uniform1f(xTransULoc, xmoveA[i]);
        gl.uniform1f(yTransULoc, ymoveA[i]);
        gl.uniform1f(zTransULoc, zmoveA[i]);

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferA[i]);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        
        gl.drawElements(gl.TRIANGLES, vertexCount, type2, offset2);

    }

    // buffer into the vertexPosition attribute
  

}

function renderPeicesB() {

    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    const vertexCount = 36;
    const type2 = gl.UNSIGNED_SHORT;
    const offset2 = 0;

    for (var i = 0; i < peicesB; i++) {
        
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferB[i]);
        gl.vertexAttribPointer(
            vPosAttribLoc,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            vPosAttribLoc);

        var peicesBColor = [0,0.5019607,0];
        // reflectivity: feed to the fragment shader
        gl.uniform3fv(diffuseULoc, peicesBColor); // pass in the diffuse reflectivity
        gl.uniform1f(transpULoc, 1.0);
        gl.uniform1f(xTransULoc, xmoveB[i]);
        gl.uniform1f(yTransULoc, ymoveB[i]);
        gl.uniform1f(zTransULoc, zmoveB[i]);

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferB[i]);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        
        gl.drawElements(gl.TRIANGLES, vertexCount, type2, offset2);

    }

    // buffer into the vertexPosition attributes

}

function renderPeicesC() {

    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    const vertexCount = 36;
    const type2 = gl.UNSIGNED_SHORT;
    const offset2 = 0;

    for (var i = 0; i < peicesC; i++) {
        
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferC[i]);
        gl.vertexAttribPointer(
            vPosAttribLoc,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            vPosAttribLoc);

        var peicesCColor = [0.18823529411,0.43137254902,1.0];
        // reflectivity: feed to the fragment shader
        gl.uniform3fv(diffuseULoc, peicesCColor); // pass in the diffuse reflectivity
        gl.uniform1f(transpULoc, 1.0);
        gl.uniform1f(xTransULoc, xmoveC[i]);
        gl.uniform1f(yTransULoc, ymoveC[i]);
        gl.uniform1f(zTransULoc, zmoveC[i]);

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferC[i]);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        
        gl.drawElements(gl.TRIANGLES, vertexCount, type2, offset2);

    }

    // buffer into the vertexPosition attributes

}

function renderPeicesD() {

    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    const vertexCount = 36;
    const type2 = gl.UNSIGNED_SHORT;
    const offset2 = 0;

    for (var i = 0; i < peicesD; i++) {
        
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferD[i]);
        gl.vertexAttribPointer(
            vPosAttribLoc,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            vPosAttribLoc);

        var peicesDColor = [1.0,0.0,0.0];
        // reflectivity: feed to the fragment shader
        gl.uniform3fv(diffuseULoc, peicesDColor); // pass in the diffuse reflectivity
        gl.uniform1f(transpULoc, 1.0);
        gl.uniform1f(xTransULoc, xmoveD[i]);
        gl.uniform1f(yTransULoc, ymoveD[i]);
        gl.uniform1f(zTransULoc, zmoveD[i]);

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferD[i]);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        
        gl.drawElements(gl.TRIANGLES, vertexCount, type2, offset2);

    }

    // buffer into the vertexPosition attributes

}

function renderPeicesE() {

    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    const vertexCount = 36;
    const type2 = gl.UNSIGNED_SHORT;
    const offset2 = 0;

    for (var i = 0; i < peicesE; i++) {
        
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferE[i]);
        gl.vertexAttribPointer(
            vPosAttribLoc,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            vPosAttribLoc);

        var peicesEColor = [1.0,0.43137254902,0.10196078431];
        // reflectivity: feed to the fragment shader
        gl.uniform3fv(diffuseULoc, peicesEColor); // pass in the diffuse reflectivity
        gl.uniform1f(transpULoc, 1.0);
        gl.uniform1f(xTransULoc, xmoveE[i]);
        gl.uniform1f(yTransULoc, ymoveE[i]);
        gl.uniform1f(zTransULoc, zmoveE[i]);

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferE[i]);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        
        gl.drawElements(gl.TRIANGLES, vertexCount, type2, offset2);

    }

    // buffer into the vertexPosition attributes

}

function loadNextA(index) {

    xmoveA[index] += -0.3;
    xmoveA[index + 1] += -0.3;
    xmoveA[index + 2] += -0.3;
    xmoveA[index + 3] += -0.3;

    ymoveA[index] += 0.1;
    ymoveA[index + 1] += 0.1;
    ymoveA[index + 2] += 0.1;
    ymoveA[index + 3] += 0.1;

    zmoveA[index] += -19.25;
    zmoveA[index + 1] += -19.25;
    zmoveA[index + 2] += -19.25;
    zmoveA[index + 3] += -19.25;

    bottomA = 1;
}

function loadNextB(index) {

    xmoveB[index] += -0.2;
    xmoveB[index + 1] += -0.2;
    xmoveB[index + 2] += -0.2;
    xmoveB[index + 3] += -0.2;

    ymoveB[index] += 0.1;
    ymoveB[index + 1] += 0.1;
    ymoveB[index + 2] += 0.1;
    ymoveB[index + 3] += 0.1;

    zmoveB[index] += -19.25;
    zmoveB[index + 1] += -19.25;
    zmoveB[index + 2] += -19.25;
    zmoveB[index + 3] += -19.25;

    bottomB = 1;
}

function loadNextC(index) {

    xmoveC[index] += -0.4;
    xmoveC[index + 1] += -0.4;
    xmoveC[index + 2] += -0.4;
    xmoveC[index + 3] += -0.4;

    ymoveC[index] += 0.1;
    ymoveC[index + 1] += 0.1;
    ymoveC[index + 2] += 0.1;
    ymoveC[index + 3] += 0.1;

    zmoveC[index] += -19.25;
    zmoveC[index + 1] += -19.25;
    zmoveC[index + 2] += -19.25;
    zmoveC[index + 3] += -19.25;

    bottomC = 1;
}

function loadNextD(index) {

    xmoveD[index] += -0.3;
    xmoveD[index + 1] += -0.3;
    xmoveD[index + 2] += -0.3;
    xmoveD[index + 3] += -0.3;

    ymoveD[index] += 0.1;
    ymoveD[index + 1] += 0.1;
    ymoveD[index + 2] += 0.1;
    ymoveD[index + 3] += 0.1;

    zmoveD[index] += -19.25;
    zmoveD[index + 1] += -19.25;
    zmoveD[index + 2] += -19.25;
    zmoveD[index + 3] += -19.25;

    bottomD = 1;
}

function loadNextE(index) {

    xmoveE[index] += -0.3;
    xmoveE[index + 1] += -0.3;
    xmoveE[index + 2] += -0.3;
    xmoveE[index + 3] += -0.3;

    zmoveE[index] += -19.25;
    zmoveE[index + 1] += -19.25;
    zmoveE[index + 2] += -19.25;
    zmoveE[index + 3] += -19.25;

    bottomE = 1;
}

function logAPosition(index) {

    var takenIndex1 = Math.round((xmoveA[index] * -1 * 10) + (ymoveA[index] * -1 * 100));
    var takenIndex2 = takenIndex1 + 1;
    var takenIndex3 = takenIndex2 + 1;
    var takenIndex4 = takenIndex2 + 10;

    taken[takenIndex1] = 1;
    taken[takenIndex2] = 1;
    taken[takenIndex3] = 1;
    taken[takenIndex4] = 1;

    console.log(taken[takenIndex1]);
    console.log(taken[takenIndex2]);
    console.log(taken[takenIndex3]);
    console.log(taken[takenIndex4]);

    console.log(takenIndex1);
    console.log(takenIndex2);
    console.log(takenIndex3);
    console.log(takenIndex4);

}

function  logBPosition(index) {

    var takenIndex1 = Math.round((xmoveB[index] * -1 * 10) + (ymoveB[index] * -1 * 100));
    var takenIndex2 = takenIndex1 + 1;
    var takenIndex3 = takenIndex2 + 1;
    var takenIndex4 = takenIndex1 + 10;

    taken[takenIndex1] = 1;
    taken[takenIndex2] = 1;
    taken[takenIndex3] = 1;
    taken[takenIndex4] = 1;

    console.log(taken[takenIndex1]);
    console.log(taken[takenIndex2]);
    console.log(taken[takenIndex3]);
    console.log(taken[takenIndex4]);

    console.log(takenIndex1);
    console.log(takenIndex2);
    console.log(takenIndex3);
    console.log(takenIndex4);

}

function logCPosition(index) {

    var takenIndex1 = Math.round((xmoveC[index] * -1 * 10) + (ymoveC[index] * -1 * 100));
    var takenIndex2 = takenIndex1 + 1;
    var takenIndex3 = takenIndex1 + 10;
    var takenIndex4 = takenIndex2 + 10;

    taken[takenIndex1] = 1;
    taken[takenIndex2] = 1;
    taken[takenIndex3] = 1;
    taken[takenIndex4] = 1;

    console.log(taken[takenIndex1]);
    console.log(taken[takenIndex2]);
    console.log(taken[takenIndex3]);
    console.log(taken[takenIndex4]);

    console.log(takenIndex1);
    console.log(takenIndex2);
    console.log(takenIndex3);
    console.log(takenIndex4);

}

function logDPosition(index) {

    var takenIndex1 = Math.round((xmoveD[index] * -1 * 10) + (ymoveD[index] * -1 * 100)) +  1;
    var takenIndex2 = takenIndex1 + 1;
    var takenIndex3 = takenIndex1 + 10 - 1;
    var takenIndex4 = takenIndex2 + 10 - 1;

    taken[takenIndex1] = 1;
    taken[takenIndex2] = 1;
    taken[takenIndex3] = 1;
    taken[takenIndex4] = 1;

    console.log(taken[takenIndex1]);
    console.log(taken[takenIndex2]);
    console.log(taken[takenIndex3]);
    console.log(taken[takenIndex4]);

    console.log(takenIndex1);
    console.log(takenIndex2);
    console.log(takenIndex3);
    console.log(takenIndex4);

}

function logEPosition(index) {

    var takenIndex1 = Math.round((xmoveE[index] * -1 * 10) + (ymoveE[index] * -1 * 100));
    var takenIndex2 = takenIndex1 + 1;
    var takenIndex3 = takenIndex1 + 2;
    var takenIndex4 = takenIndex1 + 3;

    taken[takenIndex1] = 1;
    taken[takenIndex2] = 1;
    taken[takenIndex3] = 1;
    taken[takenIndex4] = 1;

    console.log(taken[takenIndex1]);
    console.log(taken[takenIndex2]);
    console.log(taken[takenIndex3]);
    console.log(taken[takenIndex4]);

    console.log(takenIndex1);
    console.log(takenIndex2);
    console.log(takenIndex3);
    console.log(takenIndex4);

}

function checkA(index) {

    var currentIndex1 = Math.round((xmoveA[index] * -1 * 10) + (ymoveA[index] * -1 * 100));
    var currentIndex2 = currentIndex1 + 1;
    var currentIndex3 = currentIndex2 + 1;
    var currentIndex4 = currentIndex2 + 10; 

    if (currentIndex1 + 10 >= 200) {
        return  false;
    }

    if (currentIndex2 + 10 >= 200) {
        return  false;
    }

    if (currentIndex3 + 10 >= 200) {
        return  false;
    }

    if (currentIndex4 + 10 >= 200) {
        return  false;
    }

    var nextIndex1 = currentIndex1 + 10;
    var nextIndex2 = currentIndex2 + 10;
    var nextIndex3 = currentIndex3 + 10;
    var nextIndex4 = currentIndex4 + 10;

    if (taken[nextIndex1] == 1) {
        if (ymoveA[index] >= 0.0) {
            ultimateDone = true;
        }
        return true;
    }

    if (taken[nextIndex2] == 1) {
        if (ymoveA[index] >= 0.0) {
            ultimateDone = true;
        }
        return true;
    }

    if (taken[nextIndex3] == 1) {
        if (ymoveA[index] >= 0.0) {
            ultimateDone = true;
        }
        return true;
    }

    if (taken[nextIndex4] == 1) {
        if (ymoveA[index] >= 0.0) {
            ultimateDone = true;
        }
        return true;
    }

    return false;
}

function checkB(index) {

    var currentIndex1 = Math.round((xmoveB[index] * -1 * 10) + (ymoveB[index] * -1 * 100));
    var currentIndex2 = currentIndex1 + 1;
    var currentIndex3 = currentIndex2 + 1;
    var currentIndex4 = currentIndex1 + 10; 

    if (currentIndex1 + 10 >= 200) {
        return  false;
    }

    if (currentIndex2 + 10 >= 200) {
        return  false;
    }

    if (currentIndex3 + 10 >= 200) {
        return  false;
    }

    if (currentIndex4 + 10 >= 200) {
        return  false;
    }

    var nextIndex1 = currentIndex1 + 10;
    var nextIndex2 = currentIndex2 + 10;
    var nextIndex3 = currentIndex3 + 10;
    var nextIndex4 = currentIndex4 + 10;

    if (taken[nextIndex1] == 1) {
        if (ymoveB[index] >= 0.0) {
            ultimateDone = true;
        }   
        return true;
    }

    if (taken[nextIndex2] == 1) {
        if (ymoveB[index] >= 0.0) {
            ultimateDone = true;
        }  
        return true;
    }

    if (taken[nextIndex3] == 1) {
        if (ymoveB[index] >= 0.0) {
            ultimateDone = true;
        }  
        return true;
    }

    if (taken[nextIndex4] == 1) {
        if (ymoveB[index] >= 0.0) {
            ultimateDone = true;
        }  
        return true;
    }

    return false;
}

function checkC(index) {

    var currentIndex1 = Math.round((xmoveC[index] * -1 * 10) + (ymoveC[index] * -1 * 100));
    var currentIndex2 = currentIndex1 + 1;
    var currentIndex3 = currentIndex1 + 10;
    var currentIndex4 = currentIndex2 + 10; 

    if (currentIndex1 + 10 >= 200) {
        return  false;
    }

    if (currentIndex2 + 10 >= 200) {
        return  false;
    }

    if (currentIndex3 + 10 >= 200) {
        return  false;
    }

    if (currentIndex4 + 10 >= 200) {
        return  false;
    }

    var nextIndex1 = currentIndex1 + 10;
    var nextIndex2 = currentIndex2 + 10;
    var nextIndex3 = currentIndex3 + 10;
    var nextIndex4 = currentIndex4 + 10;

    if (taken[nextIndex1] == 1) {
        if (ymoveC[index] >= 0.0) {
            ultimateDone = true;
        }
        return true;
    }

    if (taken[nextIndex2] == 1) {
        if (ymoveC[index] >= 0.0) {
            ultimateDone = true;
        }
        return true;
    }

    if (taken[nextIndex3] == 1) {
        if (ymoveC[index] >= 0.0) {
            ultimateDone = true;
        }
        return true;
    }

    if (taken[nextIndex4] == 1) {
        if (ymoveC[index] >= 0.0) {
            ultimateDone = true;
        }
        return true;
    }

    return false;
}

function checkD(index) {

    var currentIndex1 = Math.round((xmoveD[index] * -1 * 10) + (ymoveD[index] * -1 * 100)) + 1;
    var currentIndex2 = currentIndex1 + 1;
    var currentIndex3 = currentIndex1 + 10 - 1;
    var currentIndex4 = currentIndex2 + 10 - 1; 

    if (currentIndex1 + 10 >= 200) {
        return  false;
    }

    if (currentIndex2 + 10 >= 200) {
        return  false;
    }

    if (currentIndex3 + 10 >= 200) {
        return  false;
    }

    if (currentIndex4 + 10 >= 200) {
        return  false;
    }

    var nextIndex1 = currentIndex1 + 10;
    var nextIndex2 = currentIndex2 + 10;
    var nextIndex3 = currentIndex3 + 10;
    var nextIndex4 = currentIndex4 + 10;

    if (taken[nextIndex1] == 1) {
        if (ymoveD[index] >= 0.0) {
            ultimateDone = true;
        }
        return true;
    }

    if (taken[nextIndex2] == 1) {
        if (ymoveD[index] >= 0.0) {
            ultimateDone = true;
        }
        return true;
    }

    if (taken[nextIndex3] == 1) {
        if (ymoveD[index] >= 0.0) {
            ultimateDone = true;
        }
        return true;
    }

    if (taken[nextIndex4] == 1) {
        if (ymoveD[index] >= 0.0) {
            ultimateDone = true;
        }
        return true;
    }

    return false;
}

function checkE(index) {

    var currentIndex1 = Math.round((xmoveE[index] * -1 * 10) + (ymoveE[index] * -1 * 100));
    var currentIndex2 = currentIndex1 + 1;
    var currentIndex3 = currentIndex1 + 2;
    var currentIndex4 = currentIndex1 + 3; 

    if (currentIndex1 + 10 >= 200) {
        return  false;
    }

    if (currentIndex2 + 10 >= 200) {
        return  false;
    }

    if (currentIndex3 + 10 >= 200) {
        return  false;
    }

    if (currentIndex4 + 10 >= 200) {
        return  false;
    }

    var nextIndex1 = currentIndex1 + 10;
    var nextIndex2 = currentIndex2 + 10;
    var nextIndex3 = currentIndex3 + 10;
    var nextIndex4 = currentIndex4 + 10;

    if (taken[nextIndex1] == 1) {
        if (ymoveE[index] >= 0.0) {
            ultimateDone = true;
        }
        return true;
    }

    if (taken[nextIndex2] == 1) {
        if (ymoveE[index] >= 0.0) {
            ultimateDone = true;
        }
        return true;
    }

    if (taken[nextIndex3] == 1) {
        if (ymoveE[index] >= 0.0) {
            ultimateDone = true;
        }
        return true;
    }

    if (taken[nextIndex4] == 1) {
        if (ymoveE[index] >= 0.0) {
            ultimateDone = true;
        }
        return true;
    }

    return false;
}

function moveADown(index) {

    if (bottomA != 20) {

        ymoveA[index] += -0.1;
        ymoveA[index + 1] += -0.1;
        ymoveA[index + 2] += -0.1;
        ymoveA[index + 3] += -0.1;
        bottomA++;

    } else {

        logAPosition(index);
        done = true;

    }
}


function moveBDown(index) {

    if (bottomB != 20) {

        ymoveB[index] += -0.1;
        ymoveB[index + 1] += -0.1;
        ymoveB[index + 2] += -0.1;
        ymoveB[index + 3] += -0.1;
        bottomB++;

    } else {

        logBPosition(index);
        done = true;

    }
}

function moveCDown(index) {

    if (bottomC != 20) {

        ymoveC[index] += -0.1;
        ymoveC[index + 1] += -0.1;
        ymoveC[index + 2] += -0.1;
        ymoveC[index + 3] += -0.1;
        bottomC++;

    } else {

        logCPosition(index);
        done = true;

    }
}

function moveDDown(index) {

    if (bottomD != 20) {

        ymoveD[index] += -0.1;
        ymoveD[index + 1] += -0.1;
        ymoveD[index + 2] += -0.1;
        ymoveD[index + 3] += -0.1;
        bottomD++;

    } else {

        logDPosition(index);
        done = true;
    }
}

function moveEDown(index) {

    if (bottomE != 20) {

        ymoveE[index] += -0.1;
        ymoveE[index + 1] += -0.1;
        ymoveE[index + 2] += -0.1;
        ymoveE[index + 3] += -0.1;
        bottomE++;

    } else {

        logEPosition(index);
        done = true;

    }
}

function moveRight() {

    if (active.length > 0) {

        var index = active[1]*4;

        // If active is type A
        if (active[0] == 1 && xmoveA[index] > -0.7) {

            var currentIndex1 = Math.round((xmoveA[index] * -1 * 10) + (ymoveA[index] * -1 * 100));
            var currentIndex2 = currentIndex1 + 1;
            var currentIndex3 = currentIndex1 + 2;
            var currentIndex4 = currentIndex2 + 10; 

            var nextIndex1 = currentIndex1 + 1;
            var nextIndex2 = currentIndex2 + 1;
            var nextIndex3 = currentIndex3 + 1;
            var nextIndex4 = currentIndex4 + 1;

            if (taken[nextIndex3] == 0 && taken[nextIndex4] == 0) {
                xmoveA[index] += -0.1;
                xmoveA[index + 1] += -0.1;
                xmoveA[index + 2] += -0.1;
                xmoveA[index + 3] += -0.1; 
            }       
        }

        // If next active is type B
        if (active[0] == 2 && xmoveB[index] > -0.7) {

            var currentIndex1 = Math.round((xmoveB[index] * -1 * 10) + (ymoveB[index] * -1 * 100));
            var currentIndex2 = currentIndex1 + 1;
            var currentIndex3 = currentIndex1 + 2;
            var currentIndex4 = currentIndex1 + 10; 

            var nextIndex1 = currentIndex1 + 1;
            var nextIndex2 = currentIndex2 + 1;
            var nextIndex3 = currentIndex3 + 1;
            var nextIndex4 = currentIndex4 + 1;

            if (taken[nextIndex3] == 0 && taken[nextIndex4] == 0) {
                xmoveB[index] += -0.1;
                xmoveB[index + 1] += -0.1;
                xmoveB[index + 2] += -0.1;
                xmoveB[index + 3] += -0.1;  
            }
            
        }

        // If next active is type C
        if (active[0] == 3 && xmoveC[index] > -0.75) {

            var currentIndex1 = Math.round((xmoveC[index] * -1 * 10) + (ymoveC[index] * -1 * 100));
            var currentIndex2 = currentIndex1 + 1;
            var currentIndex3 = currentIndex1 + 10;
            var currentIndex4 = currentIndex2 + 10; 

            var nextIndex1 = currentIndex1 + 1;
            var nextIndex2 = currentIndex2 + 1;
            var nextIndex3 = currentIndex3 + 1;
            var nextIndex4 = currentIndex4 + 1;

            if (taken[nextIndex2] == 0 && taken[nextIndex4] == 0) {
                xmoveC[index] += -0.1;
                xmoveC[index + 1] += -0.1;
                xmoveC[index + 2] += -0.1;
                xmoveC[index + 3] += -0.1; 
            } 
               
        }

        // If next active is type D
        if (active[0] == 4 && xmoveD[index] > -0.7) {

           var currentIndex1 = Math.round((xmoveD[index] * -1 * 10) + (ymoveD[index] * -1 * 100)) + 1;
           var currentIndex2 = currentIndex1 + 1;
           var currentIndex3 = currentIndex1 + 10 - 1;
           var currentIndex4 = currentIndex2 + 10 - 1; 

           var nextIndex1 = currentIndex1 + 1;
           var nextIndex2 = currentIndex2 + 1;
           var nextIndex3 = currentIndex3 + 1;
           var nextIndex4 = currentIndex4 + 1;

           if (taken[nextIndex2] == 0 && taken[nextIndex4] == 0) {
                xmoveD[index] += -0.1;
                xmoveD[index + 1] += -0.1;
                xmoveD[index + 2] += -0.1;
                xmoveD[index + 3] += -0.1; 
            } 
   
        }

        // If next active is type E
        if (active[0] == 5 && xmoveE[index] > -0.6) {

           var currentIndex1 = Math.round((xmoveE[index] * -1 * 10) + (ymoveE[index] * -1 * 100));
           var currentIndex2 = currentIndex1 + 1;
           var currentIndex3 = currentIndex1 + 2;
           var currentIndex4 = currentIndex1 + 3;  

           var nextIndex1 = currentIndex1 + 1;
           var nextIndex2 = currentIndex2 + 1;
           var nextIndex3 = currentIndex3 + 1;
           var nextIndex4 = currentIndex4 + 1;

           if (taken[nextIndex4] == 0) {
                xmoveE[index] += -0.1;
                xmoveE[index + 1] += -0.1;
                xmoveE[index + 2] += -0.1;
                xmoveE[index + 3] += -0.1; 
            } 

        }

    }

}

function moveLeft() {

    if (active.length > 0) {

        var index = active[1]*4;

        // If active is type A
        if (active[0] == 1 && xmoveA[index] < -0.05) {
            
            var currentIndex1 = Math.round((xmoveA[index] * -1 * 10) + (ymoveA[index] * -1 * 100));
            var currentIndex2 = currentIndex1 + 1;
            var currentIndex3 = currentIndex1 + 2;
            var currentIndex4 = currentIndex2 + 10; 

            var nextIndex1 = currentIndex1 - 1;
            var nextIndex2 = currentIndex2 - 1;
            var nextIndex3 = currentIndex3 - 1;
            var nextIndex4 = currentIndex4 - 1;

            if (taken[nextIndex1] == 0 && taken[nextIndex4] == 0) {
                xmoveA[index] += 0.1;
                xmoveA[index + 1] += 0.1;
                xmoveA[index + 2] += 0.1;
                xmoveA[index + 3] += 0.1;   
            }            
        }

        // If next active is type B
        if (active[0] == 2 && xmoveB[index] < -0.05) {

            var currentIndex1 = Math.round((xmoveB[index] * -1 * 10) + (ymoveB[index] * -1 * 100));
            var currentIndex2 = currentIndex1 + 1;
            var currentIndex3 = currentIndex1 + 2;
            var currentIndex4 = currentIndex1 + 10; 

            var nextIndex1 = currentIndex1 - 1;
            var nextIndex2 = currentIndex2 - 1;
            var nextIndex3 = currentIndex3 - 1;
            var nextIndex4 = currentIndex4 - 1;

            if (taken[nextIndex1] == 0 && taken[nextIndex4] == 0) {
                xmoveB[index] += 0.1;
                xmoveB[index + 1] += 0.1;
                xmoveB[index + 2] += 0.1;
                xmoveB[index + 3] += 0.1; 
            }
             
        }

        // If next active is type C
        if (active[0] == 3 && xmoveC[index] < -0.1) {

           var currentIndex1 = Math.round((xmoveC[index] * -1 * 10) + (ymoveC[index] * -1 * 100));
           var currentIndex2 = currentIndex1 + 1;
           var currentIndex3 = currentIndex1 + 10;
           var currentIndex4 = currentIndex2 + 10; 

           var nextIndex1 = currentIndex1 - 1;
           var nextIndex2 = currentIndex2 - 1;
           var nextIndex3 = currentIndex3 - 1;
           var nextIndex4 = currentIndex4 - 1; 

           if (taken[nextIndex1] == 0 && taken[nextIndex3] == 0) {
               xmoveC[index] += 0.1;
               xmoveC[index + 1] += 0.1;
               xmoveC[index + 2] += 0.1;
               xmoveC[index + 3] += 0.1;  
           }
              
        }

        // If next active is type D
        if (active[0] == 4 && xmoveD[index] < -0.05) {

           var currentIndex1 = Math.round((xmoveD[index] * -1 * 10) + (ymoveD[index] * -1 * 100)) + 1;
           var currentIndex2 = currentIndex1 + 1;
           var currentIndex3 = currentIndex1 + 10 - 1;
           var currentIndex4 = currentIndex2 + 10 - 1; 

           var nextIndex1 = currentIndex1 - 1;
           var nextIndex2 = currentIndex2 - 1;
           var nextIndex3 = currentIndex3 - 1; 
           var nextIndex4 = currentIndex4 - 1;

           if (taken[nextIndex1] == 0 && taken[nextIndex3] == 0) {
                xmoveD[index] += 0.1;
                xmoveD[index + 1] += 0.1;
                xmoveD[index + 2] += 0.1;
                xmoveD[index + 3] += 0.1;
           }
               
        }

        // If next active is type E
        if (active[0] == 5 && xmoveE[index] < -0.05) {
            
           var currentIndex1 = Math.round((xmoveE[index] * -1 * 10) + (ymoveE[index] * -1 * 100));
           var currentIndex2 = currentIndex1 + 1;
           var currentIndex3 = currentIndex1 + 2;
           var currentIndex4 = currentIndex1 + 3;  

           var nextIndex1 = currentIndex1 - 1;
           var nextIndex2 = currentIndex2 - 1;
           var nextIndex3 = currentIndex3 - 1;
           var nextIndex4 = currentIndex4 - 1;

           if (taken[nextIndex1] == 0) {
                xmoveE[index] += 0.1;
                xmoveE[index + 1] += 0.1;
                xmoveE[index + 2] += 0.1;
                xmoveE[index + 3] += 0.1; 
           }

                
        }

    }

}

function moveDown() {

    for (var i = 0; i < 5; i++) {

        if (done == false && active.length > 0) {

            var index = active[1]*4;
            
            // If next active is type A
            if (active[0] == 1) {

                if (checkA(index) == true) {

                    logAPosition(index);
                    done =  true;

                } else {

                    moveADown(index);
                }

            }

            // If next active is type B
            if (active[0] == 2) {

                if (checkB(index) == true) {

                    logBPosition(index);
                    done =  true;

                } else {

                    moveBDown(index);
                }

            }

            // If next active is type C
            if (active[0] == 3) {

                if (checkC(index) == true) {

                    logCPosition(index);
                    done =  true;

                } else {

                    moveCDown(index);
                }

            }

            // If next active is type D
            if (active[0] == 4) {

                if (checkD(index) == true) {

                    logDPosition(index);
                    done =  true;

                } else {

                    moveDDown(index);
                }


            }

            // If next active is type E
            if (active[0] == 5) {

                // moveEDown(index);

                if (checkE(index) == true) {

                    logEPosition(index);
                    done =  true;

                } else {

                    moveEDown(index);
                }

            }
        }

    }

}

function skipDown() {

    for (var i = 0; i < 20; i++) {

        if (done == false && active.length > 0) {

            var index = active[1]*4;
            
            // If next active is type A
            if (active[0] == 1) {

                if (checkA(index) == true) {

                    logAPosition(index);
                    done =  true;

                } else {

                    moveADown(index);
                }

            }

            // If next active is type B
            if (active[0] == 2) {

                if (checkB(index) == true) {

                    logBPosition(index);
                    done =  true;

                } else {

                    moveBDown(index);
                }

            }

            // If next active is type C
            if (active[0] == 3) {

                if (checkC(index) == true) {

                    logCPosition(index);
                    done =  true;

                } else {

                    moveCDown(index);
                }

            }

            // If next active is type D
            if (active[0] == 4) {

                if (checkD(index) == true) {

                    logDPosition(index);
                    done =  true;

                } else {

                    moveDDown(index);
                }


            }

            // If next active is type E
            if (active[0] == 5) {

                // moveEDown(index);

                if (checkE(index) == true) {

                    logEPosition(index);
                    done =  true;

                } else {

                    moveEDown(index);
                }

            }
        }

    }

}

function update() {

    if (done == true && active.length > 0) {

        active.shift(); // remove type
        active.shift(); // remove index

        if (active.length > 0) {

            // If next active is type A
            if (active[0] == 1) {
                loadNextA(active[1]*4);
                done = false;
            }

            // If next active is type B
            if (active[0] == 2) {
                loadNextB(active[1]*4);
                done = false;
            }

            // If next active is type C
            if (active[0] == 3) {
                loadNextC(active[1]*4);
                done = false;
            }

            // If next active is type D
            if (active[0] == 4) {
                loadNextD(active[1]*4);
                done = false;
            }

            // If next active is type E
            if (active[0] == 5) {
                loadNextE(active[1]*4);
                done = false;
            }
        }
    }

    if (done == false && active.length > 0) {

            var index = active[1]*4;
            
            // If next active is type A
            if (active[0] == 1) {

                if (checkA(index) == true) {

                    logAPosition(index);
                    done =  true;

                } else {

                    moveADown(index);
                }

            }

            // If next active is type B
            if (active[0] == 2) {

                if (checkB(index) == true) {

                    logBPosition(index);
                    done =  true;

                } else {

                    moveBDown(index);
                }

            }

            // If next active is type C
            if (active[0] == 3) {

                if (checkC(index) == true) {

                    logCPosition(index);
                    done =  true;

                } else {

                    moveCDown(index);
                }

            }

            // If next active is type D
            if (active[0] == 4) {

                if (checkD(index) == true) {

                    logDPosition(index);
                    done =  true;

                } else {

                    moveDDown(index);
                }


            }

            // If next active is type E
            if (active[0] == 5) {

                // moveEDown(index);

                if (checkE(index) == true) {

                    logEPosition(index);
                    done =  true;

                } else {

                    moveEDown(index);
                }

            }
    }

}

// render the loaded model
function renderModels() {
    
    // construct the model transform matrix, based on model state
    function makeModelTransform(whichTriSet) {
        var zAxis = vec3.create(), sumRotation = mat4.create(), temp = mat4.create(), negCtr = vec3.create();

        // move the model to the origin
        mat4.fromTranslation(mMatrix,vec3.negate(negCtr,centerArray[whichTriSet])); 
        
        // rotate the model to current interactive orientation
        vec3.normalize(zAxis,vec3.cross(zAxis,xAxisArray[whichTriSet],yAxisArray[whichTriSet])); // get the new model z axis
        mat4.set(sumRotation, // get the composite rotation
            xAxisArray[whichTriSet][0], yAxisArray[whichTriSet][0], zAxis[0], 0,
            xAxisArray[whichTriSet][1], yAxisArray[whichTriSet][1], zAxis[1], 0,
            xAxisArray[whichTriSet][2], yAxisArray[whichTriSet][2], zAxis[2], 0,
            0, 0,  0, 1);
        mat4.multiply(mMatrix,sumRotation,mMatrix); // R(ax) * S(1.2) * T(-ctr)
        
        // translate back to model center
        mat4.multiply(mMatrix,mat4.fromTranslation(temp,centerArray[whichTriSet]),mMatrix); // T(ctr) * R(ax) * S(1.2) * T(-ctr)

        // translate model to current interactive orientation
        mat4.multiply(mMatrix,mat4.fromTranslation(temp,transArray[whichTriSet]),mMatrix); // T(pos)*T(ctr)*R(ax)*S(1.2)*T(-ctr)
        
    } // end make model transform
    
    // var hMatrix = mat4.create(); // handedness matrix
    var pMatrix = mat4.create(); // projection matrix
    var vMatrix = mat4.create(); // view matrix
    var mMatrix = mat4.create(); // model matrix
    var pvMatrix = mat4.create(); // hand * proj * view matrices
    var pvmMatrix = mat4.create(); // hand * proj * view * model matrices
    
    window.requestAnimationFrame(renderModels); // set up frame render callback
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    
    // set up projection and view
    // mat4.fromScaling(hMatrix,vec3.fromValues(-1,1,1)); // create handedness matrix
    mat4.perspective(pMatrix,0.5*Math.PI,1,0.1,10); // create projection matrix
    mat4.lookAt(vMatrix,Eye,Center,Up); // create view matrix
    mat4.multiply(pvMatrix,pvMatrix,pMatrix); // projection
    mat4.multiply(pvMatrix,pvMatrix,vMatrix); // projection * view

    // render each triangle set in the grid
    for (var whichTriSet=0; whichTriSet<numTriangleSets; whichTriSet++) {
        
        // make model transform, add to view project
        // makeModelTransform(whichTriSet);
        mat4.multiply(pvmMatrix,pvMatrix,mMatrix); // project * view * model
        gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in the m matrix
        gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in the hpvm matrix
        
        // reflectivity: feed to the fragment shader
        gl.uniform3fv(diffuseULoc,colorArray[whichTriSet]); // pass in the diffuse reflectivity
        gl.uniform1f(transpULoc, 1.0);
        gl.uniform1f(xTransULoc, 0.0);
        gl.uniform1f(yTransULoc, 0.0);
        gl.uniform1f(zTransULoc, 0.0);
        
        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichTriSet]); // activate
        gl.vertexAttribPointer(vPosAttribLoc,3,gl.FLOAT,false,0,0); // feed

        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffers[whichTriSet]); // activate
        gl.drawElements(gl.TRIANGLES,3*triSetSizes[whichTriSet],gl.UNSIGNED_SHORT,0); // render
        
    } // end for each triangle set

    mat4.multiply(pvmMatrix,pvMatrix,mMatrix); // project * view * model
    gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in the m matrix
    gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in the hpvm matrix

    // Tell WebGL how to pull out the positions from the position

    renderPeicesA();
    renderPeicesB();
    renderPeicesC();
    renderPeicesD();
    renderPeicesE();


    if (ultimateDone == false) {
        console.log(ultimateDone);
        
        round++;

        if (round%25 == 0) {
            update();
        }

    }
    
  
    
} // end render model


/* MAIN -- HERE is where execution begins after window load */

function main() {
  
  setupWebGL(); // set up the webGL environment
  loadGrid(); // load in the models from tri file
  ultimateDone = false;
  loadPeicesA();
  loadPeicesB();
  loadPeicesC();
  loadPeicesD();
  loadPeicesE();
  setActive();
  setTaken();
  loadNextA(0);
  setupShaders(); // setup the webGL shaders
  renderModels(); // draw the triangles using webGL
  
} // end main
