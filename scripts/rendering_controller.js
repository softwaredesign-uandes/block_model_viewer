if ( WEBGL.isWebGLAvailable() === false ) {
  document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

var camera, scene, renderer;
var controls;
var cubeGeometry;

var blockMeshes = [];
var blockSize = 50;

function initRenderer() {
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
}

function loadBlockModel(blocks, blocksAttributeInfo) {
  function showBlock(block, blocksAttributeInfo) {
    if (uiParams.currentAttribute === null) return true;
    if (uiParams.hideZeros && (block[uiParams.currentAttribute] === 0)) return false;

    var range = blocksAttributeInfo[uiParams.currentAttribute].max - blocksAttributeInfo[uiParams.currentAttribute].min;
    if (range === 0) return true;


    return (100 * block[uiParams.currentAttribute] / range) >= uiParams.threshold;
  }

  function addBlock(block, blocksAttributeInfo) {
    var cubeMaterial = new THREE.MeshLambertMaterial( { color: getBlockColor(block, blocksAttributeInfo) } );
    var blockMesh = new THREE.Mesh( cubeGeometry, cubeMaterial );
    
    var blockSizeWithOffset = blockSize * 1.1;
    blockMesh.position.set( blockSizeWithOffset * block.x,
      blockSizeWithOffset * block.y, blockSizeWithOffset * block.z);
    blockMeshes.push(blockMesh);

    scene.add( blockMesh );
    
  }

  function getBlockColor(block, blocksAttributeInfo) {
    if (uiParams.currentAttribute === null) return new THREE.Color(0x999999);

    var min = blocksAttributeInfo[uiParams.currentAttribute].min;
    var max = blocksAttributeInfo[uiParams.currentAttribute].max;
    if (min === max) return new THREE.Color(0x999999);

    var value = block[uiParams.currentAttribute];

    var hue = Math.floor(255.0 * value / (max - min));
    var hsl = "hsl("+ hue + ", 100%, 70%)";
    return new THREE.Color(hsl);
  }

  clearScene();
  blocks.filter(function(block) { return showBlock(block, blocksAttributeInfo); }).forEach(function(block) { return addBlock(block, blocksAttributeInfo); })
}

function clearScene() {
  blockMeshes.forEach(function(mesh) { scene.remove(mesh); });
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