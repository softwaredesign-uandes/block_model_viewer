class FeatureFlagsCLient {
  async isEnabled(apiBaseUrl, flag) {
    let response = await fetch(apiBaseUrl + '/api/feature_flags/');
    let data = await response.json()
    return data[flag];
  }
}