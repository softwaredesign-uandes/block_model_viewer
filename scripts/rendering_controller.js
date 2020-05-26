class RenderingController {
  constructor() {
    this.camera, this.scene, this.renderer;
    this.controls;
    this.cubeGeometry;

    this.blockMeshes = [];
    this.blockSize = 50;
    this.selectedBlock;
    this.selectedBlockColor;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  initRenderer() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xf0f0f0 );
    this.scene.add( new THREE.AmbientLight( 0x606060 ) );
    var light = new THREE.PointLight( 0xffffff );
    light.position.set( 1000, 1000, 1000 );
    this.scene.add(light);

    this.cubeGeometry = new THREE.BoxBufferGeometry( this.blockSize, this.blockSize, this.blockSize );

    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.set( 2000, 2000, 3300 );
    this.camera.lookAt( 0, 0, 0 );
    this.camera.up.set(0, 0, 1);
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );

    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    this.controls.update();

    var that = this;
    function onWindowResize() {
      that.camera.aspect = window.innerWidth / window.innerHeight;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function onMouseMove(event) {
      that.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      that.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }

    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'mousemove', onMouseMove, false );
  }

  loadBlockModel(blocks, blocksAttributeInfo, uiParams) {
    function showBlock(block, blocksAttributeInfo, uiParams) {
      if (uiParams.currentAttribute === null) return true;
      if (uiParams.hideZeros && (block[uiParams.currentAttribute] === 0)) return false;

      var range = blocksAttributeInfo[uiParams.currentAttribute].max - blocksAttributeInfo[uiParams.currentAttribute].min;
      if (range === 0) return true;


      return (100 * block[uiParams.currentAttribute] / range) >= uiParams.threshold;
    }

    function addBlock(block, blocksAttributeInfo, uiParams, scene, blockMeshes, geometry, blockSize) {
      var cubeMaterial = new THREE.MeshLambertMaterial( { color: getBlockColor(block, blocksAttributeInfo, uiParams) } );
      var blockMesh = new THREE.Mesh( geometry, cubeMaterial );

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

    this.clearScene();
    blocks
      .filter(block => { return showBlock(block, blocksAttributeInfo, uiParams); })
      .forEach(block => { return addBlock(block, blocksAttributeInfo, uiParams, this.scene, this.blockMeshes, this.cubeGeometry, this.blockSize); })
  }

  clearScene() {
    this.blockMeshes.forEach(mesh => { this.scene.remove(mesh); });
  }

  selectBlock() {
    this.raycaster.setFromCamera( this.mouse, this.camera );

    var intersects = this.raycaster.intersectObjects( this.scene.children );
    var newSelectedBlock = intersects.length > 0 ? intersects[0].object : null;
    if (newSelectedBlock === this.selectedBlock) return;

    if (this.selectedBlock) this.selectedBlock.material.color.set(this.selectedBlockColor);
    if (newSelectedBlock) {
      this.selectedBlockColor = newSelectedBlock.material.color.clone();
      newSelectedBlock.material.color.set(0x000000);
    }
    this.selectedBlock = newSelectedBlock;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.selectBlock();
    this.renderer.render( this.scene, this.camera );
  }
}