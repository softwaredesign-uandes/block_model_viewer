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

const client = new APICLient();
const featureFlagsClient = new FeatureFlagsCLient();
const renderingController = new RenderingController(updateBlockInfo);

init();
renderingController.animate();

function init() {
  renderingController.initRenderer();

  uiParams = new UIParams();
  apiParams = new APIParams();
  gui = new dat.GUI();

  var urlHandler = gui.add(apiParams, 'apiUrl');

  urlHandler.onChange(async () => {
    let block_models = await client.getBlockModels(apiParams.apiUrl);
    let restful_response = await featureFlagsClient.isEnabled('restful_response');
    if (restful_response) {
      block_models = block_models['block_models'];
    }
    let blockModelNames = block_models.map(block_model => { return block_model.name; });

    if (namesHandler) gui.remove(namesHandler);
    namesHandler = gui.add(apiParams, 'currentBlockModel', blockModelNames);

    namesHandler.onChange(async (name) => {
      blocks = await client.getBlocks(apiParams.apiUrl, name);
      let restful_response = await featureFlagsClient.isEnabled('restful_response');
      if (restful_response) {
        blocks = blocks['block_model']['blocks'];
      }
      blocksAttributeInfo = calculateBlockAttributesInfo(blocks);
      loadBlockAttributes(blocks[0]);
      renderingController.loadBlockModel(blocks, blocksAttributeInfo, uiParams);
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

  attributeHandler.onChange(() => {
    renderingController.loadBlockModel(blocks, blocksAttributeInfo, uiParams);
  });

  currentAttributeThresholdHandler.onChange(() => {
    renderingController.loadBlockModel(blocks, blocksAttributeInfo, uiParams);
  });

  hideZerosHandler.onChange(() => {
    renderingController.loadBlockModel(blocks, blocksAttributeInfo, uiParams);
  });
}

function calculateBlockAttributesInfo(blocks) {
  return Object.keys(blocks[0]).reduce((map, a) => {
    map[a] = {
      min: Math.min.apply(Math, blocks.map(b => { return b[a]; })),
      max: Math.max.apply(Math, blocks.map(b => { return b[a]; }))
    };
    return map;
  }, {});
}

async function updateBlockInfo(blockIndex) {
  let block = await client.getBlock(apiParams.apiUrl, apiParams.currentBlockModel, blockIndex);
  block = block["block"];
  let indexElement = document.getElementById("index");
  indexElement.textContent = block.index;
  let positionElement = document.getElementById("position");
  positionElement.textContent = "" + block.x + "," + block.y + "," + block.z + ",";
  let massElement = document.getElementById("mass");
  massElement.textContent = block.mass;
  let gradeElement = document.getElementById("grades");
  gradeElement.innerHTML = '';
  Object.keys(block.grades).forEach((g) => {
    let newLi = document.createElement("li");
    let newLabel = document.createElement("label");
    newLabel.textContent = g + ": ";
    let newSpan = document.createElement("span");
    newSpan.textContent = block.grades[g];
    newLi.appendChild(newLabel);
    newLi.appendChild(newSpan);
    gradeElement.appendChild(newLi);
  });
}
