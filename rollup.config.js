import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  // Entry point for the bundle
  input: 'src/InteractiveVideoSDK.ts',
  output: {
    // Output file configuration
    file: 'dist/interactive-video-sdk.js',
    format: 'umd', // Universal Module Definition format
    name: 'InteractiveVideoSDK' // Global variable name for UMD build
  },
  plugins: [
    resolve(), // Allows Rollup to resolve modules from node_modules
    commonjs(), // Converts CommonJS modules to ES6
    typescript() // Compiles TypeScript files
  ]
};