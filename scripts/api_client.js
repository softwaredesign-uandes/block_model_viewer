class APICLient {
  async getBlockModels(apiBaseUrl) {
    let response = await fetch(apiBaseUrl + '/api/block_models/');
    let data = await response.json()
    return data;
  }

  async getBlocks(apiBaseUrl, block_model_name) {
    let response = await fetch(apiBaseUrl + '/api/block_models/' + block_model_name + '/blocks/');
    let data = await response.json()
    return data;
  }
}