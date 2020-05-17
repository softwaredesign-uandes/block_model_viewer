if ( WEBGL.isWebGLAvailable() === false ) {
  document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

var camera, scene, renderer;
var controls;
var cubeGeometry;

var blockMeshes = [];
var blockSize = 50;

var UIParams = function() {
  this.currentAttribute = null;
  this.transparent = false;
};

var params;
var gui;

var blocks = [];

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xf0f0f0 );

  var ambientLight = new THREE.AmbientLight( 0x606060 );
  scene.add( ambientLight );
  var light = new THREE.PointLight( 0xffffff );
  light.position.set( 1000, 1000, 1000 );
  scene.add( light );

  cubeGeometry = new THREE.BoxBufferGeometry( blockSize, blockSize, blockSize );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set( 2000, 2000, 3300 );
  camera.lookAt( 0, 0, 0 );
  camera.up.set(0, 0, 1);
  scene.add(camera);

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.update();

  window.addEventListener( 'resize', onWindowResize, false );

  params = new UIParams();
  gui = new dat.GUI();

  getBlocks().then(function(response) {
    response.json().then(function(data) {
      blocks = data;
      loadBlockAttributes(blocks[0]);
      loadBlockModel(blocks);
    });
  });
}

function loadBlockAttributes(block) {
  var attributeHandler = gui.add(params, 'currentAttribute', Object.keys(block));
  var transparentHandler = gui.add( params, 'transparent');

  attributeHandler.onChange(function() {
    loadBlockModel(blocks);
  });

  transparentHandler.onChange(function() {
    loadBlockModel(blocks);
  });
}

function loadBlockModel(blocks) {
  function addBlock(block) {
    var cubeMaterial = new THREE.MeshLambertMaterial( { color: getBlockColor(block), 
      opacity: Math.max(0.02, block[params.currentAttribute]), transparent: params.transparent } );
    var blockMesh = new THREE.Mesh( cubeGeometry, cubeMaterial );
    
    var blockSizeWithOffset = blockSize * 1.1;
    blockMesh.position.set( blockSizeWithOffset * block.x_index,
      blockSizeWithOffset * block.y_index, blockSizeWithOffset * block.z_index);
    blockMeshes.push(blockMesh);

    scene.add( blockMesh );
    
  }

  function getBlockColor(block) {
    if (params.currentAttribute === null || block[params.currentAttribute] < 0.001 || block[params.currentAttribute] >= 1)
      return new THREE.Color(0x999999);
    var hue = 168;
    var lightning = Math.floor(block[params.currentAttribute] * 70);
    var hsl = "hsl("+ hue + ", 100%, " + lightning + "%)";
    return new THREE.Color(hsl);
  }

  clearScene();
  for(var i=0; i<blocks.length; i++) {
    addBlock(blocks[i]);
  }
}

function clearScene() {
  for(var i=0; i<blockMeshes.length; i++) {
    scene.remove(blockMeshes[i]);
  }; 
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  requestAnimationFrame( animate );

  controls.update();



  renderer.render( scene, camera );
}