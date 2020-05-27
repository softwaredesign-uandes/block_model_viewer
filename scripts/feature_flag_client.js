FEATURE_FLAG_API_URL = 'https://dry-brushlands-69779.herokuapp.com/api/feature_flags/'

class FeatureFlagsCLient {
  async isEnabled(flag) {
    let response = await fetch(FEATURE_FLAG_API_URL);
    let data = await response.json()
    return data[flag];
  }
}