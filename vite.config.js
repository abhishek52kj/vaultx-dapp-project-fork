import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react({ jsxRuntime: 'automatic' }),
      nodePolyfills({
        exclude: ['vm'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        protocolImports: true,
      })
    ],

    define: {
      'process.env': {
        VITE_DCL_DEFAULT_ENV: env.VITE_DCL_DEFAULT_ENV,
        VITE_BASE_URL: env.VITE_BASE_URL
      },
      global: 'globalThis'
    },

    resolve: {
      alias: {
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        buffer: 'buffer',
        util: 'util',
        assert: 'assert',
        process: 'process/browser',
        vm: '/src/shims/empty.js',

        // project aliases
        assets: '/src/assets',
        components: '/src/components',
        containers: '/src/containers',
        contracts: '/src/contracts',
        helpers: '/src/helpers',
        hooks: '/src/hooks',
        providers: '/src/providers'
      }
    },

    optimizeDeps: {
      include: [
        'buffer',
        'process',
        'crypto-browserify',
        'stream-browserify'
      ],

      esbuildOptions: {
        define: { global: 'globalThis' },
        plugins: [
          NodeGlobalsPolyfillPlugin({ process: true, buffer: true }),
          NodeModulesPolyfillPlugin()
        ]
      }
    },

    build: {
      chunkSizeWarningLimit: 10000,
      sourcemap: false,
      rollupOptions: {
        onwarn(warning, warn) {
          if (
            warning.code === 'INVALID_ANNOTATION' &&
            warning.id?.includes('@walletconnect/qrcode-modal')
          ) {
            return;
          }
          warn(warning);
        }
      }
    },

    ...(command === 'build'
      ? { base: env.VITE_BASE_URL }
      : undefined)
  };
});
