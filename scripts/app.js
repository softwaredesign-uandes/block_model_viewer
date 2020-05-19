var UIParams = function() {
  this.currentAttribute = null;
  this.threshold = 0;
  this.hideZeros = true;
};

var APIParams = function() {
  this.apiUrl = "";
  this.currentBlockModel = null;
};

var uiParams;
var clientParams;
var namesHandler;
var attributeHandler;
var currentAttributeThresholdHandler;
var hideZerosHandler;
var gui;

var blocks = [];
var blocksAttributeInfo = {};

init();
animate();

function init() {
  initRenderer();

  uiParams = new UIParams();
  apiParams = new APIParams();
  gui = new dat.GUI();

  var urlHandler = gui.add(apiParams, 'apiUrl');

  urlHandler.onChange(function() {
    getBlockModels(apiParams.apiUrl).then(function(response) {
      response.json().then(function(data) {
        var block_models = data;
        var blockModelNames = block_models.map(function(block_model) { return block_model.name; });

        if (namesHandler) gui.remove(namesHandler);
        namesHandler = gui.add(apiParams, 'currentBlockModel', blockModelNames);

        namesHandler.onChange(function(name) {
          getBlocks(apiParams.apiUrl, name).then(function(response) {
            response.json().then(function(data) {
              blocks = data;
              blocksAttributeInfo = calculateBlockAttributesInfo(blocks);
              loadBlockAttributes(blocks[0]);
              loadBlockModel(blocks, blocksAttributeInfo, uiParams);
            });
          }).catch(function(err) {
            console.log('Error fetching blocks', err);
          });
        });
      });
    }).catch(function(err) {
      console.log('Error fetching block_models', err);
    });
  });
}

function loadBlockAttributes(block) {
  if (attributeHandler) gui.remove(attributeHandler);
  attributeHandler = gui.add(uiParams, 'currentAttribute', Object.keys(block));

  if (currentAttributeThresholdHandler) gui.remove(currentAttributeThresholdHandler);
  currentAttributeThresholdHandler = gui.add(uiParams, 'threshold', 0, 100);

  if (hideZerosHandler) gui.remove(hideZerosHandler);
  hideZerosHandler = gui.add(uiParams, 'hideZeros');

  attributeHandler.onChange(function() {
    loadBlockModel(blocks, blocksAttributeInfo, uiParams);
  });

  currentAttributeThresholdHandler.onChange(function() {
    loadBlockModel(blocks, blocksAttributeInfo, uiParams);
  });

  hideZerosHandler.onChange(function() {
    loadBlockModel(blocks, blocksAttributeInfo, uiParams);
  });
}

function calculateBlockAttributesInfo(blocks) {
  return Object.keys(blocks[0]).reduce(function(map, a) {
    map[a] = {
      min: Math.min.apply(Math, blocks.map(function(b) { return b[a]; })), 
      max: Math.max.apply(Math, blocks.map(function(b) { return b[a]; }))
    };
    return map;
  }, {});
}
