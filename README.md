# nuxt-rpc

`nuxt-rpc` allows you to call your backend-functions from the frontend, as if they were local. No need for an extra language or DSL to learn and maintain. Based off of https://github.com/wobsoriano/nuxt-remote-fn

## Install

```bash
npm install nuxt-rpc
```

```ts
export default defineNuxtConfig({
  modules: [
    'nuxt-rpc',
  ],
})
```

## Usage

Export your remote functions in `server/rpc/**/*.{ts,js,mjs}` files:

```ts
// server/rpc/todo.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getTodos () {
  const todos = await prisma.todo.findMany()
  return todos
}
```

Directly use any SQL/ORM query to retrieve & mutate data on client.

```vue
<script setup lang="ts">
const todos = await rpc.todo.getTodos()
</script>

<template>
  <TodoList :todos="todos" />
</template>
```

The `server/rpc` part of the path informs the module that this code should never end up in the browser and to convert it to an API call instead (`POST /api/__rpc/todo/getTodos`).

Checkout [the playground example](/playground).

## Custom fetch options
You can modify fetch options (add headers, etc) with the rpcClient

```vue
index.vue

<script setup lang="ts">
const postsClient = rpcClient({
  fetchOptions:{
    headers:{
      "Authorization": "Bearer token"
    }
  }
}).posts;
const post = postsClient.getPost(1);
</script>

<template>
  <div>
    <span>Post: </span>
    <span>{{ post?.title }}</span>
  </div>
</template>

```

All capabilities of `$fetch` are availabile, including callbacks:

```ts
const client = rpcClient({
  fetchOptions: {
    onRequest({ request }) {
      // do something
    }
  }
})
```

## H3 Event

The `useH3Event` hook provides the `event` object of the current request. You can use it to check headers, log requests, or extend the event's request object.

```ts
import { useH3Event } from 'nuxt-rpc/server'
import { getRequestHeader, createError } from 'h3'
import { decodeAndVerifyJwtToken } from '~/somewhere/in/utils'

export async function addTodo(todo: Todo) {
  const event = useH3Event()

  async function getUserFromHeader() {
    const authorization = getRequestHeader(event, 'authorization')
    if (authorization) {
      const user = await decodeAndVerifyJwtToken(authorization.split(' ')[1])
      return user
    }
    return null
  }

  const user = await getUserFromHeader()

  if (!user) {
    throw createError({ statusCode: 401 })
  }

  const result = await prisma.todo.create({
    data: {
      ...todo,
      userId: user.id
    }
  })

  return result
}
```

You can use all built-in [h3 utilities](https://github.com/unjs/h3#utilities) inside your exported functions.

## createContext

Each rpc file can also export a `createContext` function that is called for each incoming request:

```ts
export function createContext() {
  const event = useH3Event()

  async function getUserFromHeader() {
    const authorization = getRequestHeader(event, 'authorization')
    if (authorization) {
      const user = await decodeAndVerifyJwtToken(authorization.split(' ')[1])
      return user
    }
    return null
  }

  event.context.user = await getUserFromHeader()
}

export async function addTodo(todo: Todo) {
  const event = useH3Event()

  if (!event.context.user) {
    throw createError({ statusCode: 401 })
  }

  // addTodo logic
}
```

## useAsyncData

`nuxt-rpc` can work seamlessly with [`useAsyncData`](https://nuxt.com/docs/api/composables/use-async-data/):

```vue
<script setup lang="ts">
const { getTodos } = rpc.todo;
const { data: todos } = useAsyncData('todos', () => getTodos())
</script>
```

## Fetch options:

Since `nuxt.config.ts` file doesn't accept functions as values, you can use the client directly to add `$fetch` options:

```ts
import type { RemoteFunction } from '#build/rpc-handler'
import { createClient } from 'nuxt-rpc/client'

const client = createClient<RemoteFunction>({
  fetchOptions: {
    onRequest({ request }) {
      // do something
    }
  }
})

const todo = await client.todo.getTodo(1)
```

## Why this module

Sharing data from server to client involves a lot of ceremony. i.e. an `eventHandler` needs to be set up and `useFetch` needs to be used in the browser.

Wouldn't it be nice if all of that was automatically handled and all you'd need to do is import `getTodos` on the client, just like you do in `eventHandler`'s? That's where `nuxt-rpc` comes in. With `nuxt-rpc`, all exported functions from `server/rpc.` files automatically become available to the browser as well.

This module builds upon the great work of [nuxt-remote-fn](https://github.com/wobsoriano/nuxt-remote-fn) and adds support for Nuxt 4 as well as organizing remote functions under server/rpc instead of looking for .server. in the filename (which can cause issues with server plugins and components). In addition, files can be nested under subdirectories of server/rpc, which will be added to the function signature - this can be useful for adding middleware checks. Ex:

```ts
./server/rpc/public/todos

export function getTodos(){
  ...
}

```

Would be addressable by `public_todos.getTodos()`. Middleware can check for the path prefix to perform auth and other functions.

## Development

- Run `cp playground/.env.example playground/.env`
- Run `pnpm dev:prepare` to generate type stubs.
- Use `pnpm dev` to start [playground](./playground) in development mode.

## Credits

This project is inspired by [tRPC](http://trpc.io/), [Telefunc](https://telefunc.com) and [nuxt-server-fn](https://github.com/antfu/nuxt-server-fn). It is directly forked from [nuxt-remote-fn](https://github.com/wobsoriano/nuxt-remote-fn)

## License

MIT
