import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    bundle: true,
    splitting: false,
    sourcemap: false,
    clean: true,
    dts: false,
    minify: false,
    minifySyntax: true,
    outDir: './dist',
})
