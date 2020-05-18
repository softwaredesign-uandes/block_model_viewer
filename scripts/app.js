var UIParams = function() {
  this.currentAttribute = null;
  this.transparent = false;
};

var APIParams = function() {
  this.apiUrl = "";
  this.currentBlockModel = null;
};

var uiParams;
var clientParams;
var namesHandler;
var attributeHandler;
var transparentHandler
var gui;

var blocks = [];

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
              loadBlockAttributes(blocks[0]);
              loadBlockModel(blocks);
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

  if (transparentHandler) gui.remove(transparentHandler);
  transparentHandler = gui.add(uiParams, 'transparent');

  attributeHandler.onChange(function() {
    loadBlockModel(blocks);
  });

  transparentHandler.onChange(function() {
    loadBlockModel(blocks);
  });
}
