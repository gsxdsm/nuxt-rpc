import { eventHandler, createError, readBody, readFormData } from 'h3';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { EventHandler, EventHandlerRequest, H3Event } from 'h3';

const DEFAULT_CONTEXT = {} as H3Event;

const asyncLocalStorage = new AsyncLocalStorage<H3Event>();

export function useH3Event(): H3Event {
  return asyncLocalStorage.getStore() || DEFAULT_CONTEXT;
}

type ModuleFunctionsMap = Record<
  string,
  Record<string, (...args: any[]) => any>
>;

export function createRpcHandler<
  FunctionMap extends ModuleFunctionsMap,
  ModuleName extends keyof FunctionMap
>(functions: FunctionMap): EventHandler<EventHandlerRequest, Promise<any>> {
  const handler = eventHandler<{
    body: {
      args: Parameters<FunctionMap[ModuleName][keyof FunctionMap[ModuleName]]>;
    };
  }>(async (event) => {
    // Check method first
    if (event.method !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed',
      });
    }

    const contentType = event.headers.get('content-type') || undefined;
    //Empty contentType is okay, as it represents an internal function call
    if (
      contentType &&
      !contentType.includes('application/json') &&
      !contentType.includes('multipart/form-data') &&
      !contentType.includes('application/x-www-form-urlencoded')
    ) {
      throw createError({
        statusCode: 415,
        statusMessage: 'Unsupported content type',
      });
    }

    let body: { args: any } = { args: [] };

    try {
      if (
        contentType == 'application/json' ||
        contentType == 'application/x-www-form-urlencoded'
      ) {
        body = await readBody(event);
      } else if (
        !contentType ||
        contentType?.startsWith('multipart/form-data')
      ) {
        const formData = !contentType
          ? event.node.req.body
          : await readFormData(event);
        if (
          formData.has('__rpc_encoded') &&
          formData.get('__rpc_encoded') === 'true'
        ) {
          const args: (FormData | any)[] = [];

          for (const [key, value] of formData) {
            if (key === '__rpc_encoded') continue;
            if (key.startsWith('_arg_')) {
              // add the arg value at the index specified by _arg_${index}
              const index = parseInt(key.split('_')[2], 10);
              args[index] = value;
            } else if (key.startsWith('_formdata_')) {
              const [indexStr, formKey] = key.split('_').slice(2);
              const index = parseInt(indexStr, 10);
              if (!args[index]) args[index] = new FormData();
              (args[index] as FormData).append(formKey, value);
            }
          }
          body = { args };
        } else {
          body = { args: [formData] };
        }
      }
      const { moduleId, functionName } = event.context.params || {};

      if (!moduleId || !functionName) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Missing moduleId or functionName in request',
        });
      }

      if (!(moduleId in functions)) {
        throw createError({
          statusCode: 400,
          statusMessage: `[nuxt-rpc]: Module ${
            moduleId as string
          } does not exist. Are you sure the file exists?`,
        });
      }

      if (typeof functions[moduleId][functionName] !== 'function') {
        throw createError({
          statusCode: 400,
          statusMessage: `[nuxt-rpc]: ${
            functionName as string
          } is not a function.`,
        });
      }

      if ('createContext' in functions[moduleId]) {
        await functions[moduleId]['createContext'].apply(event);
      }

      const result = functions[moduleId][functionName].apply(event, body.args);
      return result;
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError({
        statusCode: 400,
        statusMessage: error.message,
      });
    }
  });

  return eventHandler((event) => {
    return asyncLocalStorage.run(event, () => handler(event));
  });
}
