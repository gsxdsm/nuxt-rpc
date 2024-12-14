<script setup lang="ts">
import { useAsyncData } from '#app';
import { rpc } from '#build/rpc-client';

const { data } = await useAsyncData('ping', () =>
  rpc().hello.hello({ name: 'Evan' })
);

//Test caching
const cachedTime1 = await rpc({ cache: true }).hello.getTime('Evan');
const cachedTime2 = await rpc({ cache: true }).hello.getTime('Evan');

const cachedTimesAreEqual = cachedTime1 === cachedTime2;

const uncachedTime1 = await rpc({ cache: false }).hello.getTime('Evan');
const uncachedTime2 = await rpc({ cache: false }).hello.getTime('Evan');

const uncachedTimesAreEqual = uncachedTime1 === uncachedTime2;

//Ensure that cached values are different when arguments change
const cachedTimeWithEvan1 = await rpc({ cache: true }).hello.getTime('Evan3');
const cachedTimeWithEvan2 = await rpc({ cache: true }).hello.getTime('Evan4');

const cachedTimesWithDifferentArgsAreEqual =
  cachedTimeWithEvan1 === cachedTimeWithEvan2;
</script>

<template>
  <div>{{ data?.message }}</div>
  <div>Cached1: {{ cachedTime1 }}</div>
  <div>Cached2: {{ cachedTime2 }}</div>
  <div>Uncached1: {{ uncachedTime1 }}</div>
  <div>Uncached2: {{ uncachedTime2 }}</div>
  <div>CachedWithEvan1: {{ cachedTimeWithEvan1 }}</div>
  <div>CachedWithEvan2: {{ cachedTimeWithEvan2 }}</div>
  <div v-if="cachedTimesAreEqual">cached times are equal</div>
  <div v-else>cached times are not equal</div>
  <div v-if="uncachedTimesAreEqual">uncached times are equal</div>
  <div v-else>uncached times are not equal</div>
  <div v-if="cachedTimesWithDifferentArgsAreEqual">
    cached times with different args are equal
  </div>
  <div v-else>cached times with different args are not equal</div>
</template>
