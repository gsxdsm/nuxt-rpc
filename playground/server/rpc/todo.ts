import { useH3Event } from '../../../src/runtime/server';
import { prisma } from '~/lib/prisma';
import * as fs from 'fs';

export async function getTodos() {
  const todos = await prisma.todo.findMany();
  return todos;
}

export function getTodo(id: number) {
  return prisma.todo.findFirstOrThrow({
    where: {
      id,
    },
  });
}

export async function toggleTodo(id: number) {
  const todo = await getTodo(id);
  return prisma.todo.update({
    where: { id },
    data: { completed: !todo.completed },
  });
}

export function deleteTodo(id: number) {
  return prisma.todo.delete({ where: { id } });
}

export function addTodo({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return prisma.todo.create({
    data: {
      title,
      content,
      completed: false,
    },
  });
}

export function testForm(formData: FormData) {
  const data = {};
  if (formData) {
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
  }
  return data;
}
export async function uploadFile(name: string, formData: FormData) {
  //write the file to disk
  const file = formData.get('file');
  if (file instanceof Blob) {
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(name, buffer);
    const uuid = crypto.randomUUID();
    const fileName = `${uuid}-${name}`;
    const filePath = `playground/uploads/${fileName}`;
    fs.writeFileSync(filePath, buffer);
    return 'File uploaded: ' + filePath;
  }
}

export function createContext() {
  const event = useH3Event();
  // console.log('event.context.params', event.context.params)
}
