import { getEvent } from 'nuxt-remote-fn/server'
import { prisma } from './prisma'

export async function getTodos () {
  const todos = await prisma.todo.findMany()
  return todos
}

export function getTodo (id: number) {
  return prisma.todo.findFirstOrThrow({
    where: {
      id
    }
  })
}

export async function toggleTodo (id: number) {
  const { path } = getEvent()
  console.log('path', path)

  const todo = await getTodo(id)
  return prisma.todo.update({
    where: { id },
    data: { completed: !todo.completed }
  })
}

export function deleteTodo (id: number) {
  return prisma.todo.delete({ where: { id } })
}

export function addTodo ({ title, content }: { title: string; content: string }) {
  return prisma.todo.create({
    data: {
      title,
      content,
      completed: false
    }
  })
}
