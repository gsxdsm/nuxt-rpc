<script setup lang="ts">
import { useAsyncData } from '#app';

const { data: todos, refresh } = await useAsyncData('todos', () =>
  rpc().todo.getTodos()
);
const todoClient = rpc({
  cache: false,
  fetchOptions: {
    headers: {
      Authorization: 'Bearer token',
    },
    onRequest() {
      console.log('request');
    },
  },
}).todo;

const formResult = ref({});
const formResultOnMount = ref({});

const formData = new FormData();
formData.append('name', 'John - From SSR');
formResult.value = await rpc().todo.testForm(formData);

onMounted(async () => {
  const formDataOnMount = new FormData();
  formDataOnMount.append('name', 'John - From On Mount');
  formResultOnMount.value = await rpc().todo.testForm(formDataOnMount);
});

async function handleChange(id: number) {
  await rpc().todo.toggleTodo(id);
  await refresh();
}

async function handleDelete(id: number) {
  await todoClient.deleteTodo(id);
  await refresh();
}
</script>

<template>
  <div>
    <ul>
      <li v-for="todo in todos" :key="todo.id">
        <h2>
          <span>{{ todo.title }}</span>
          <input
            type="checkbox"
            :checked="todo.completed"
            @change="handleChange(todo.id)"
          />
          <button @click="handleDelete(todo.id)">remove</button>
        </h2>
        <p>
          <span
            :style="{
              textDecoration: todo.completed ? 'line-through' : undefined,
            }"
          >
            {{ todo.content }}
          </span>
          {{ todo.completed ? ' ✅ done' : '' }}
        </p>
      </li>
    </ul>
    <hr />
    <TodoForm @create="refresh" />
    <h2>Form Data Tests</h2>
    <div>Form Result (SSR): {{ formResult }}</div>
    <div>Form Result (OnMounted): {{ formResultOnMount }}</div>
  </div>
</template>

<style>
input[type='checkbox'] {
  cursor: pointer;
  margin: 13;
}
</style>
