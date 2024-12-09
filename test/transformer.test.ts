import { describe, it, expect } from 'vitest';
import { getModuleId } from '../src/runtime/transformer';

describe('transformer', () => {
  it('receives a valid variable name for the module id', async () => {
    expect(getModuleId('user/nuxt/server/rpc/todo.ts')).toBe('todo');
    expect(getModuleId('user/nuxt/server/rpc/public/todo.ts')).toBe(
      'public_todo'
    );
    expect(getModuleId('user/nuxt/server/rpc/todo-todo.ts')).toBe('todo_todo');
    expect(getModuleId('user/nuxt/server/rpc/1-todo.ts')).toBe('_1_todo');
  });
});
