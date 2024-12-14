import { defineNuxtConfig } from 'nuxt/config';
import Module from '../src/module';

export default defineNuxtConfig({
  rpc: {
    apiRoute: '/api/__rpc',
    paths: ['server/rpc', 'server/functions'],
    cacheDefault: false,
    rpcClientName: 'rpc',
    rpcCachedClientName: 'rpcCached',
    rpcCachelessClientName: 'rpcCacheless',
  },
  sourcemap: {
    client: true,
  },
  modules: [Module],
});
