var apiBaseUrl = "http://127.0.0.1:5000/api";
function getBlockModels() {

}

function getBlockModelInfo(block_model_id) {

}

function getBlocks(block_model_id) {
  return fetch(apiBaseUrl + '/blocks/')
}