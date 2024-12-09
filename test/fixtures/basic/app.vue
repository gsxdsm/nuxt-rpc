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
const cachedTimeWithEvan = await rpc({ cache: true }).hello.getTime('Evan');
const cachedTimeWithEvan2 = await rpc({ cache: true }).hello.getTime('Evan2');

const cachedTimesWithDifferentArgsAreEqual =
  cachedTimeWithEvan === cachedTimeWithEvan2;
</script>

<template>
  <div>{{ data?.message }}</div>
  <div>{{ cachedTime1 }}</div>
  <div>{{ cachedTime2 }}</div>
  <div>{{ uncachedTime1 }}</div>
  <div>{{ uncachedTime2 }}</div>
  <div v-if="cachedTimesAreEqual">cached times are equal</div>
  <div v-else>cached times are not equal</div>
  <div v-if="uncachedTimesAreEqual">uncached times are equal</div>
  <div v-else>uncached times are not equal</div>
  <div v-if="cachedTimesWithDifferentArgsAreEqual">
    cached times with different args are equal
  </div>
  <div v-else>cached times with different args are not equal</div>
</template>
