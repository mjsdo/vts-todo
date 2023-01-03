import 'webpack-dev-server';

import type { Configuration } from 'webpack';

import { merge } from 'webpack-merge';

import common from './webpack.common';

const config: Configuration = {
  devtool: 'inline-source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  devServer: {
    hot: true,
    historyApiFallback: true,
  },
};

export default merge(common, config);
