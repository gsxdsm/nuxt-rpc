<script setup lang="ts">
import { rpc } from '#build/rpc-client'

// Basic FormData test
const formData1 = new FormData()
formData1.append('name', 'John')
formData1.append('age', '30')
const singleFormResult = await rpc().form.handleSingleFormData(formData1)

// FormData with parameter
const formData2 = new FormData()
formData2.append('title', 'Engineer')
formData2.append('level', 'Senior')
const withParamResult = await rpc().form.handleFormDataWithParam(
  'John',
  formData2
)

// FormData with file
const formData3 = new FormData()
const fileContent = new Blob(['test file content'], { type: 'text/plain' })
const testFile = new File([fileContent], 'test.txt', { type: 'text/plain' })
formData3.append('file', testFile)
formData3.append('description', 'Test upload')
const withFileResult = await rpc().form.handleFormDataWithFile(
  'John',
  formData3
)

// Cached FormData test
const cachedClient = rpc({ cache: true })
const formDataCached = new FormData()
formDataCached.append('name', 'John-Cached')
formDataCached.append('age', '31')

const firstCachedResult = await cachedClient.form.handleSingleFormData(formDataCached)
const secondCachedResult = await cachedClient.form.handleSingleFormData(formDataCached)
const cacheHit = firstCachedResult === secondCachedResult

const fileFormDataCached = new FormData()
const fileContentCached = new Blob(['test cached file content'], { type: 'text/plain' })
const testFileCached = new File([fileContentCached], 'test-cached.txt', { type: 'text/plain' })
fileFormDataCached.append('file', testFileCached)

const cachedWithFileResult = await cachedClient.form.handleFormDataWithFile(
  'John-Cached',
  fileFormDataCached
)

</script>

<template>
  <div>
    <div data-test="single-form">{{ singleFormResult }}</div>
    <div data-test="with-param">{{ withParamResult }}</div>
    <div data-test="with-file">{{ withFileResult }}</div>
    <div data-test="cached-form">{{ firstCachedResult }}</div>
    <div data-test="cache-hit">Cache hit: {{ cacheHit }}</div>
    <div data-test="cached-with-file">{{ cachedWithFileResult }}</div>
  </div>
</template>
