const API_BASE_URL = 'https://quiet-taiga-20979.herokuapp.com/'
class APICLient {
  async getBlockModels() {
    let response = await fetch(API_BASE_URL + '/api/block_models/');
    let data = await response.json()
    return data.block_models;
  }

  async getBlocks(block_model_name) {
    let response = await fetch(API_BASE_URL + '/api/block_models/' + block_model_name + '/blocks/');
    let data = await response.json()
    return data.block_model.blocks;
  }

  async getBlock(block_model_name, block_index) {
    let response = await fetch(API_BASE_URL + '/api/block_models/' + block_model_name + '/blocks/' + block_index);
    let data = await response.json()
    return data.block;
  }

  async extractBlock(block_model_name, block_index) {
    let response = await fetch(API_BASE_URL + '/api/block_models/' + block_model_name + '/blocks/' + block_index + "/extract/", { method: 'POST' } );
    let data = await response.json()
    return data.blocks;
  }
}