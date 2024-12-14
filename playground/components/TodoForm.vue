<script setup lang="ts">
import { ref } from '#imports';
import { addTodo } from '~/server/rpc/todo';

const title = ref('');
const content = ref('');
const submitting = ref(false);
const file = ref();

const emit = defineEmits(['create']);

async function handleSubmit() {
  submitting.value = true;
  const todo = await addTodo({
    title: title.value,
    content: content.value,
  });
  console.log('added todo: ', todo);
  submitting.value = false;
  title.value = '';
  content.value = '';
  emit('create');
}

async function handleFileSubmit() {
  submitting.value = true;
  const formData = new FormData();
  if (file.value && file.value.files.length > 0) {
    formData.append('file', file.value.files[0]);
  }
  const result = await rpc().todo.uploadFile('new-file', formData);
  submitting.value = false;
  file.value.value = '';
}
</script>

<template>
  <div>
    <h1>Add todo</h1>
    <form @submit.prevent="handleSubmit">
      <input v-model="title" placeholder="Title" type="text" /> <br />
      <input v-model="content" placeholder="Content" type="text" /> <br />
      <button type="submit" :disabled="submitting">Submit</button>
    </form>
    <h1>Upload File Test</h1>
    <form @submit.prevent="handleFileSubmit">
      <input type="file" ref="file" />
      <button type="submit" :disabled="submitting">Submit</button>
    </form>
  </div>
</template>
