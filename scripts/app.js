const UIParams = function() {
  this.currentAttribute = null;
  this.threshold = 0;
  this.hideZeros = true;
};

const APIParams = function() {
  this.apiUrl = "";
  this.featureFlagUrl = "https://dry-brushlands-69779.herokuapp.com";
  this.currentBlockModel = null;
};

let uiParams;
let clientParams;
let namesHandler;
let attributeHandler;
let currentAttributeThresholdHandler;
let hideZerosHandler;
let gui;

let blocks = [];
let extractedBlocks = [];
let blocksAttributeInfo = {};

const client = new APICLient();
const featureFlagsClient = new FeatureFlagsCLient();
const renderingController = new RenderingController(updateBlockInfo, extractBlock);

init();
renderingController.animate();

function init() {
  renderingController.initRenderer();

  uiParams = new UIParams();
  apiParams = new APIParams();
  gui = new dat.GUI();

  gui.add(apiParams, 'featureFlagUrl');
  let urlHandler = gui.add(apiParams, 'apiUrl');

  urlHandler.onChange(async () => {
    let block_models = await client.getBlockModels(apiParams.apiUrl);
    let restful_response = await featureFlagsClient.isEnabled(apiParams.featureFlagUrl, 'restful_response');
    if (restful_response) {
      block_models = block_models['block_models'];
    }
    let blockModelNames = block_models.map(block_model => { return block_model.name; });

    if (namesHandler) gui.remove(namesHandler);
    namesHandler = gui.add(apiParams, 'currentBlockModel', blockModelNames);

    namesHandler.onChange(async (name) => {
      blocks = await client.getBlocks(apiParams.apiUrl, name);
      let restful_response = await featureFlagsClient.isEnabled(apiParams.featureFlagUrl, 'restful_response');
      if (restful_response) {
        blocks = blocks['block_model']['blocks'];
      }
      blocksAttributeInfo = calculateBlockAttributesInfo(blocks);
      loadBlockAttributes(blocks[0]);
      extractedBlocks = [];
      uiParams.currentAttribute = null;
      renderingController.loadBlockModel(blocks);
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
    renderingController.updateBlockModel(blocksAttributeInfo, uiParams, extractedBlocks);
  });

  currentAttributeThresholdHandler.onChange(() => {
    renderingController.updateBlockModel(blocksAttributeInfo, uiParams, extractedBlocks);
  });

  hideZerosHandler.onChange(() => {
    renderingController.updateBlockModel(blocksAttributeInfo, uiParams, extractedBlocks);
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
  let block_info = await featureFlagsClient.isEnabled(apiParams.featureFlagUrl, 'block_info');
  if (!block_info) return;

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

  if (!block.grades) return;
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

async function extractBlock(blockIndex) {
  let blocksToExtract = await client.extractBlock(apiParams.apiUrl, apiParams.currentBlockModel, blockIndex);
  extractedBlocks = extractedBlocks.concat(blocksToExtract["blocks"].map(b => b.index));
  renderingController.updateBlockModel(blocksAttributeInfo, uiParams, extractedBlocks);
}
