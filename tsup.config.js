import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'], // Your entry file(s)
    format: ['esm'], // Output formats (e.g., CommonJS and ES Module)
    bundle: true, // Bundle all dependencies into the output
    splitting: false, // Disable code splitting (create a single file)
    sourcemap: false, // Include sourcemaps
    clean: true, // Clean output directory before build
    dts: true, // Generate TypeScript declaration files
    minify: false, // Minify output (set true for production)
    external: [], // Empty array to ensure no dependencies are excluded
    minifySyntax: true,
});
