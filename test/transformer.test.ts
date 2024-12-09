import { describe, it, expect } from 'vitest';
import { getModuleId } from '../src/runtime/transformer';

describe('transformer', () => {
  it('receives a valid variable name for the module id', async () => {
    expect(getModuleId('user/nuxt/server/rpc/todo.ts', '/server/rpc/')).toBe(
      'todo'
    );
    expect(getModuleId('user/nuxt/server/rpc/todo.ts', 'server/rpc')).toBe(
      'todo'
    );
    expect(
      getModuleId('user/nuxt/server/functions/todo.ts', [
        '/server/rpc/',
        '/server/functions/',
      ])
    ).toBe('todo');
    expect(
      getModuleId('user/nuxt/server/rpc/public/todo.ts', '/server/rpc/')
    ).toBe('public_todo');
    expect(
      getModuleId('user/nuxt/server/rpc/todo-todo.ts', '/server/rpc/')
    ).toBe('todo_todo');
    expect(getModuleId('user/nuxt/server/rpc/1-todo.ts', '/server/rpc/')).toBe(
      '_1_todo'
    );
    expect(
      getModuleId('user/nuxt/server/rpc/public/todos/index.ts', '/server/rpc/')
    ).toBe('public_todos');
  });
});
