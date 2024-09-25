// rollup.config.js

// Import necessary Rollup plugins
import typescript from 'rollup-plugin-typescript2'; // Plugin for TypeScript support
import resolve from '@rollup/plugin-node-resolve'; // Plugin to resolve node modules
import commonjs from '@rollup/plugin-commonjs'; // Plugin to convert CommonJS modules to ES6
import terser from '@rollup/plugin-terser'; // Plugin for minifying the output

// Export Rollup configuration
export default {
  // Entry point for the bundle
  input: 'src/InteractiveVideoSDK.ts',

  // Output configuration for the bundle
  output: [
    {
      file: 'dist/interactive-video-sdk.js', // Output file path for UMD build
      format: 'umd', // Universal Module Definition format
      name: 'InteractiveVideoSDK', // Global variable name for UMD build
      sourcemap: true, // Generate source maps for debugging
    },
    {
      file: 'dist/interactive-video-sdk.min.js', // Output file path for minified UMD build
      format: 'umd', // Universal Module Definition format
      name: 'InteractiveVideoSDK', // Global variable name for UMD build
      plugins: [terser()], // Minify the output using terser
      sourcemap: true, // Generate source maps for debugging
    },
    {
      file: 'dist/interactive-video-sdk.esm.js', // Output file path for ES module build
      format: 'es', // ES module format
      sourcemap: true, // Generate source maps for debugging
    },
  ],

  // Plugins to be used in the build process
  plugins: [
    resolve(), // Allows Rollup to resolve modules from node_modules
    commonjs(), // Converts CommonJS modules to ES6
    typescript({ // Compiles TypeScript files
      useTsconfigDeclarationDir: true, // Use the declaration directory specified in tsconfig
    }),
  ],
};