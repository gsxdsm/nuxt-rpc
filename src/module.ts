import { relative, resolve } from 'node:path';
import {
  addImports,
  addServerHandler,
  addTemplate,
  addVitePlugin,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit';
import fg from 'fast-glob';
import defu from 'defu';
import dedent from 'dedent';
import * as pathe from 'pathe';
import { createFilter } from '@rollup/pluginutils';
import { getModuleId, transformServerFiles } from './runtime/transformer';
let patterns: string[];
export interface ModuleOptions {
  paths?: string | string[];
  apiRoute?: string;
  rpcClientName?: string;
  rpcCachedClientName?: string;
  rpcCachelessClientName?: string;
  cacheDefault?: boolean;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-rpc',
    configKey: 'rpc',
    version: '^3.3.0',
  },
  defaults: {
    paths: '/server/rpc/',
    apiRoute: '/api/__rpc',
    rpcClientName: 'rpc',
    rpcCachedClientName: 'rpcCached',
    rpcCachelessClientName: 'rpcCacheless',
    cacheDefault: false,
  },
  async setup(options, nuxt) {
    nuxt.options.runtimeConfig.rpc = defu(
      nuxt.options.runtimeConfig.rpc,
      options
    );
    const files: string[] = [];

    const paths = Array.isArray(options.paths)
      ? options.paths
      : [options.paths];

    patterns = paths.map((path) => {
      if (!path?.endsWith(pathe.sep)) {
        path = path + pathe.sep;
      }
      if (!path.startsWith(pathe.sep)) {
        path = pathe.sep + path;
      }
      return `**${path}**/*.{ts,js,mjs}`;
    });

    const filter = createFilter(patterns);

    // Transpile runtime and handler
    const resolver = createResolver(import.meta.url);
    const handlerPath = resolver.resolve(nuxt.options.buildDir, 'rpc-handler');
    const runtimeDir = resolver.resolve('./runtime');
    nuxt.options.build.transpile.push(runtimeDir, handlerPath);
    nuxt.options.vite ??= {};
    nuxt.options.vite.optimizeDeps ??= {};
    nuxt.options.vite.optimizeDeps.exclude ??= [];
    nuxt.options.vite.optimizeDeps.exclude.push('nuxt-rpc');
    nuxt.hook('builder:watch', async (e, path) => {
      path = relative(
        nuxt.options.rootDir,
        resolve(nuxt.options.rootDir, path)
      );
      if (e === 'change') return;
      if (filter(path)) {
        await scanRemoteFunctions();
        await nuxt.callHook('builder:generateApp');
      }
    });

    addServerHandler({
      route: options.apiRoute + '/:moduleId/:functionName',
      method: 'post',
      handler: handlerPath,
    });

    addVitePlugin(transformServerFiles({ filter, paths: options.paths! }));

    addImports([
      {
        name: 'createClient',
        as: 'createClient',
        from: resolver.resolve(runtimeDir, 'client'),
      },
    ]);

    await scanRemoteFunctions();

    addTemplate({
      filename: 'rpc-handler.ts',
      write: true,
      getContents() {
        const filesWithId = files.map((file) => ({
          file: file.replace(/\.ts$/, ''),
          id: getModuleId(file, options.paths!),
        }));
        return dedent`
          import { createRpcHandler } from ${JSON.stringify(
            resolver.resolve(runtimeDir, 'server')
          )}
          ${filesWithId
            .map((i) => `import * as ${i.id} from ${JSON.stringify(i.file)}`)
            .join('\n')}

          export type RemoteFunction = {
            ${filesWithId.map((i) => `${i.id}: typeof ${i.id}`).join('\n')}
          }

          export default createRpcHandler({
            ${filesWithId.map((i) => i.id).join(',\n')}
          })

        `;
      },
    });

    addTemplate({
      filename: 'rpc-client.ts',
      write: true,
      getContents() {
        return dedent`
          import type { RemoteFunction } from '#build/rpc-handler';
          import { createClient, type RpcClientOptions } from 'nuxt-rpc/client';
          import defu from 'defu';

          // Client with default cache setting
          export const ${options.rpcClientName} = (
            options?: RpcClientOptions): RemoteFunction => {
              return createClient<RemoteFunction>(
                defu(options, {
                  apiRoute: '${options.apiRoute}',
                  cache: ${options.cacheDefault},
                })
              );
            }; 

            // Client with cache disabled
            export const ${options.rpcCachelessClientName} = ${options.rpcClientName}({ cache: false })
            

            // Client with cache enabled
            export const ${options.rpcCachedClientName} = ${options.rpcClientName}({ cache: true })

                  
        `;
      },
    });

    addImports([
      {
        name: options.rpcClientName!,
        from: resolver.resolve(nuxt.options.buildDir, 'rpc-client'),
      },
      {
        name: options.rpcCachedClientName!,
        from: resolver.resolve(nuxt.options.buildDir, 'rpc-client'),
      },
      {
        name: options.rpcCachelessClientName!,
        from: resolver.resolve(nuxt.options.buildDir, 'rpc-client'),
      },
    ]);

    async function scanRemoteFunctions() {
      files.length = 0;
      const updatedFiles = await fg(patterns!, {
        cwd: nuxt.options.rootDir,
        absolute: true,
        onlyFiles: true,
        ignore: ['!**/node_modules', '!**/dist'],
      });
      files.push(...new Set(updatedFiles));
      return files;
    }
  },
});
