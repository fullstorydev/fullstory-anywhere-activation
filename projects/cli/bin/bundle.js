import { fileURLToPath } from 'url';
import path from 'path';

const { build } = await import('esbuild');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NOTE this references the /packages folder, which should always be located in the same repo as the CLI
const packagesDir = `${__dirname}/../..`;

const resolveFsModules = {
  name: '@fullstory module resolver',
  setup(build) {
    // see https://esbuild.github.io/plugins/#on-resolve-arguments for args type
    build.onResolve({ filter: /^@fullstory/ }, async args => {
      // split the path (@fullstory/sdk/http/client.js) to separate the package name (@fullstory/sdk) from file (http/client.js)
      const [fullstory, moduleName, ...paths] = args.path.split('/');
      return moduleName === 'activation-sdk' ? {path: `${packagesDir}/sdk/dist/${paths.join('/')}` }:
       { path: `${packagesDir}/${moduleName}/dist/${paths.join('/')}` };
    })
  },
}

await build({
  bundle: true,
  entryPoints: ['./src/**/*.ts'],
  format: 'esm',
  inject: ['./bin/cjs-shims.js'],
  loader: { '.node': 'copy' },
  minify: false,
  outdir: './dist',
  platform: 'node',
  plugins: [resolveFsModules],
  splitting: true,
  treeShaking: true,
})