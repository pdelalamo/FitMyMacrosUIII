module.exports = function (api) {
  api.cache(true);
  return {
    plugins: ['dotenv'],
    presets: ['babel-preset-expo'],
  };
};
