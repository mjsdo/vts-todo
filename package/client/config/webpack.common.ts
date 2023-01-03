import type { Configuration } from 'webpack';

import path from 'path';

import dotenv from 'dotenv';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';

const isDevelopment = process.env.NODE_ENV === 'development';

const envPath = isDevelopment
  ? path.resolve(__dirname, '..', 'env/.env.dev')
  : path.resolve(__dirname, '..', 'env/.env.prod');

dotenv.config({ path: envPath });

function isTruthy<T>(
  value: T,
): value is Exclude<T, false | null | undefined | '' | 0> {
  return Boolean(value);
}

const config: Configuration = {
  context: __dirname,
  entry: '../src/index.ts',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../build'),
    clean: true,
    assetModuleFilename: 'assets/[hash][ext][query]',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.[tj]s$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico|woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: '../public/index.html',
      templateParameters: {
        PUBLIC_URL: process.env.PUBLIC_URL,
      },
    }),
    // new webpack.EnvironmentPlugin(['API_URL', 'PUBLIC_URL']),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(__dirname, '..', 'tsconfig.json'),
      },
      async: true,
      formatter: {
        type: 'codeframe',
        options: {
          forceColor: true,
        },
      },
    }),
  ].filter(isTruthy),
};

export default config;
