import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/InteractiveVideoSDK.ts',
  output: {
    file: 'dist/interactive-video-sdk.js',
    format: 'umd',
    name: 'InteractiveVideoSDK'
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript()
  ]
};