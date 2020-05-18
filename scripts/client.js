function getBlockModels(apiBaseUrl) {
  return fetch(apiBaseUrl + '/api/block_models/');
}

function getBlockModelInfo(apiBaseUrl, block_model_name) {
  return fetch(apiBaseUrl + '/api/block_models/' + block_model_name);
}

function getBlocks(apiBaseUrl, block_model_name) {
  return fetch(apiBaseUrl + '/api/block_models/' + block_model_name + '/blocks/');
}