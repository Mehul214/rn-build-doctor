import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: false,
  sourcemap: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
