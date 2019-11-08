const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: process.env.NODE_ENV ? process.env.NODE_ENV.trim() : 'production',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.webpack.json',
            },
          },
        ],
        exclude: /(node_modules|test)/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'index.umd.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'VuexMultiHistory',
    libraryTarget: 'umd',
  },
  externals: {
    vue: {
      commonjs: 'vue',
      commonjs2: 'vue',
      amd: 'vue',
      root: 'Vue',
    },
    vuex: {
      commonjs: 'vuex',
      commonjs2: 'vuex',
      amd: 'vuex',
      root: 'Vuex',
    },
  },
};
