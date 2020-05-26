if ( WEBGL.isWebGLAvailable() === false ) {
  document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

var camera, scene, renderer;
var controls;
var cubeGeometry;

var blockMeshes = [];
var blockSize = 50;
var selectedBlock;
var selectedBlockColor;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function initRenderer() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xf0f0f0 );
  scene.add( new THREE.AmbientLight( 0x606060 ) );
  var light = new THREE.PointLight( 0xffffff );
  light.position.set( 1000, 1000, 1000 );
  scene.add(light);

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
  window.addEventListener( 'mousemove', onMouseMove, false );
}

function loadBlockModel(blocks, blocksAttributeInfo, uiParams) {
  function showBlock(block, blocksAttributeInfo, uiParams) {
    if (uiParams.currentAttribute === null) return true;
    if (uiParams.hideZeros && (block[uiParams.currentAttribute] === 0)) return false;

    var range = blocksAttributeInfo[uiParams.currentAttribute].max - blocksAttributeInfo[uiParams.currentAttribute].min;
    if (range === 0) return true;


    return (100 * block[uiParams.currentAttribute] / range) >= uiParams.threshold;
  }

  function addBlock(block, blocksAttributeInfo, uiParams) {
    var cubeMaterial = new THREE.MeshLambertMaterial( { color: getBlockColor(block, blocksAttributeInfo, uiParams) } );
    var blockMesh = new THREE.Mesh( cubeGeometry, cubeMaterial );

    var blockSizeWithOffset = blockSize * 1.1;
    blockMesh.position.set( blockSizeWithOffset * block.x,
      blockSizeWithOffset * block.y, blockSizeWithOffset * block.z);
    blockMeshes.push(blockMesh);

    scene.add(blockMesh);
  }

  function getBlockColor(block, blocksAttributeInfo, uiParams) {
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
  blocks
    .filter(block => { return showBlock(block, blocksAttributeInfo, uiParams); })
    .forEach(block => { return addBlock(block, blocksAttributeInfo, uiParams); })
}

function clearScene() {
  blockMeshes.forEach(mesh => { scene.remove(mesh); });
}

function selectBlock() {
  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObjects( scene.children );
  var newSelectedBlock = intersects.length > 0 ? intersects[0].object : null;
  if (newSelectedBlock === selectedBlock) return;

  if (selectedBlock) selectedBlock.material.color.set(selectedBlockColor);
  if (newSelectedBlock) {
    selectedBlockColor = newSelectedBlock.material.color.clone();
    newSelectedBlock.material.color.set(0x000000);
  }
  selectedBlock = newSelectedBlock;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onMouseMove(event) {
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function animate() {
  requestAnimationFrame( animate );
  controls.update();
  selectBlock();
  renderer.render( scene, camera );
}