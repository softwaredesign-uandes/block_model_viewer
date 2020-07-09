const UIParams = function() {
  this.blockModel = null;
  this.column = null;
  this.filter = 0;
  this.filterZeros = true;
};

let uiParams;
let attributeHandler;
let currentAttributeThresholdHandler;
let hideZerosHandler;
let gui;

let blocks = [];
let extractedBlocks = [];
let blocksAttributeInfo = {};

const client = new APICLient();
const renderingController = new RenderingController(updateBlockInfo, extractBlock);

window.addEventListener("load", async () => {
  renderingController.initRenderer();
  renderingController.animate();
  await init();
});

async function init() {
  uiParams = new UIParams();
  gui = new dat.GUI();

  let block_models = await client.getBlockModels();
  let blockModelNames = block_models.map(block_model => { return block_model.name; });
  let namesHandler = gui.add(uiParams, 'blockModel', blockModelNames);

  namesHandler.onChange(async (name) => {
    blocks = await client.getBlocks(name);
    blocksAttributeInfo = calculateBlockAttributesInfo(blocks);
    loadBlockAttributes(blocks[0]);
    extractedBlocks = [];
    uiParams.column = null;
    renderingController.loadBlockModel(blocks);
  });
}

function loadBlockAttributes(block) {
  if (attributeHandler) gui.remove(attributeHandler);
  attributeHandler = gui.add(uiParams, 'column', Object.keys(block));

  if (currentAttributeThresholdHandler) gui.remove(currentAttributeThresholdHandler);
  currentAttributeThresholdHandler = gui.add(uiParams, 'filter', 0, 100);

  if (hideZerosHandler) gui.remove(hideZerosHandler);
  hideZerosHandler = gui.add(uiParams, 'filterZeros');

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
      min: Math.min.apply(Math, blocks.map(b => b[a])),
      max: Math.max.apply(Math, blocks.map(b => b[a]))
    };
    return map;
  }, {});
}

async function updateBlockInfo(blockIndex) {
  let block = blocks.find(b => b.index == blockIndex);
  let attributesElement = document.getElementById("attributes");
  attributesElement.innerHTML = '';
  Object.keys(block).forEach((k) => {
    let newLi = document.createElement("li");
    let newLabel = document.createElement("label");
    newLabel.textContent = k + ": ";
    let newSpan = document.createElement("span");
    newSpan.textContent = block[k];
    newLi.appendChild(newLabel);
    newLi.appendChild(newSpan);
    attributesElement.appendChild(newLi);
  });
}

async function extractBlock(blockIndex) {
  let blocksToExtract = await client.extractBlock(blockIndex);
  extractedBlocks = extractedBlocks.concat(blocksToExtract.map(b => b.index));
  renderingController.updateBlockModel(blocksAttributeInfo, uiParams, extractedBlocks);
}
