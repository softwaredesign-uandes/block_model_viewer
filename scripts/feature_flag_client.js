const FF_API_BASE_URL = 'https://dry-brushlands-69779.herokuapp.com'
class FeatureFlagsCLient {
  async isEnabled(flag) {
    let response = await fetch(FF_API_BASE_URL + '/api/feature_flags/');
    let data = await response.json()
    return data[flag];
  }
}