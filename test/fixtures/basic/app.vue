<script setup lang="ts">
import { useAsyncData } from '#app'
import { rpc } from '#build/rpc-client'


const { data } = await useAsyncData('ping', () => rpc.hello({ name: 'Evan' }))
</script>

<template>
  <div>{{ data?.message }}</div>
</template>
