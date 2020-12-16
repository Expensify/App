module.exports = {
    project: {
        ios: {},
        android: {},
    },
    assets: ['./assets/fonts/'],
};

const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  use: {
    loader: "url-loader",
    options: {
      name: "[name].[ext]",
      esModule: false,
    }
  }
};