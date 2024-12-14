<script setup lang="ts">
import { rpc } from '#build/rpc-client';

// Basic FormData test
const formData1 = new FormData();
formData1.append('name', 'John');
formData1.append('age', '30');
const singleFormResult = await rpc().form.handleSingleFormData(formData1);

// FormData with parameter
const formData2 = new FormData();
formData2.append('title', 'Engineer');
formData2.append('level', 'Senior');
const withParamResult = await rpc().form.handleFormDataWithParam(
  'John',
  formData2
);

// FormData with file
const formData3 = new FormData();
const fileContent = new Blob(['test file content'], { type: 'text/plain' });
const testFile = new File([fileContent], 'test.txt', { type: 'text/plain' });
formData3.append('file', testFile);
formData3.append('description', 'Test upload');
const withFileResult = await rpc().form.handleFormDataWithFile(
  'John',
  formData3
);
</script>

<template>
  <div>
    <div data-test="single-form">{{ singleFormResult }}</div>
    <div data-test="with-param">{{ withParamResult }}</div>
    <div data-test="with-file">{{ withFileResult }}</div>
  </div>
</template>
