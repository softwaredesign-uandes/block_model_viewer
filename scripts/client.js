function getBlockModels() {

}

function getBlockModelInfo(block_model_id) {

}

function getBlocks(block_model_id) {
  function generateBlocks() {
    var blocks = [];
    var xSize = 20;
    var ySize = 20;
    var zSize = 10;
    for(var i=0; i<xSize; i++) {
      for(var j=0; j<ySize; j++) {
        for(var k=0; k<zSize; k++) {
          var cuGrade = 0.0;
          var auGrade = 0.0;
          if(isBlockInCore(i, j, k, xSize, ySize, zSize)) {
            cuGrade += Math.random() / 2.0;
            auGrade += Math.random() / 2.0;
          }
          blocks.push({
            "x_index": i,
            "y_index": j,
            "z_index": k,
            "grades": {
              "au" : auGrade,
              "cu" : cuGrade,
            }
          });
        }
      }
    }
    return blocks;
  }

  function isBlockInCore(i, j, k, xSize, ySize, zSize){
    return i > (1.0/3.0) * xSize && i < (2.0/3.0) * xSize && j > (1.0/3.0) * ySize && 
      j < (2.0/3.0) * ySize && k < (1.0/3.0) * zSize;
  }
  return generateBlocks();
}