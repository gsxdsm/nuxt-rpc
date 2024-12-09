import { defineNuxtConfig } from 'nuxt/config';
import Module from '../src/module';

export default defineNuxtConfig({
  rpc: {
    apiRoute: '/api/__rpc',
    cacheDefault: false,
    rpcClientName: 'rpc',
    rpcCachedClientName: 'rpcCached',
    rpcCachelessClientName: 'rpcCacheless',
  },
  modules: [Module],
});
