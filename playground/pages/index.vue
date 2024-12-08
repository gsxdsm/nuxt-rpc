<script setup lang="ts">
import { useAsyncData } from '#app';

const { data: todos, refresh } = await useAsyncData('todos', () =>
  rpc.todo.getTodos()
);
const todoClient = rpcClient({
  headers: {
    Authorization: 'Bearer token',
  },
  onRequest() {
    console.log('request');
  },
}).todo;

async function handleChange(id: number) {
  await rpc.todo.toggleTodo(id);
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
  </div>
</template>

<style>
input[type='checkbox'] {
  cursor: pointer;
  margin: 13;
}
</style>
