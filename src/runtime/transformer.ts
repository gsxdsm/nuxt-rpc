import type { Plugin } from 'vite';
import { init, parse } from 'es-module-lexer';
import * as pathe from 'pathe';

export function getModuleId(file: string, paths: string | string[]) {
  if (!Array.isArray(paths)) {
    paths = [paths];
  }
  let path = paths.find((path) => file.includes(path));
  if (path === undefined) {
    throw new Error(
      `The file ${file} does not belong to any of the paths ${paths}`
    );
  }
  if (!path.startsWith(pathe.sep)) {
    path = pathe.sep + path;
  }
  if (!path.endsWith(pathe.sep)) {
    path = path + pathe.sep;
  }
  const parsedPath = pathe.parse(file);
  const parentModule = parsedPath.dir.split(path)[1];
  let id = parsedPath.name;
  if (parentModule)
    if (parsedPath.name === 'index') {
      id = parentModule;
    } else {
      id = `${parentModule}_${parsedPath.name}`;
    }
  const validId = id
    .replaceAll(pathe.sep, '_')
    .replaceAll(/[^\p{L}\p{N}_$]/gu, '_')
    .replace(/^\d/, '_$&');
  return validId;
}

interface Options {
  filter: (id: unknown) => boolean;
  paths: string | string[];
}

export function transformServerFiles(options: Options): Plugin {
  return {
    name: 'vite-plugin-remote-functions',
    enforce: 'post',
    async transform(code, id, opts) {
      if (opts?.ssr) {
        return;
      }

      if (!options.filter(id)) {
        return;
      }

      const moduleId = getModuleId(id, options.paths);
      const result = await transformExportsToRemoteFunctions(code, moduleId);

      return {
        code: result,
      };
    },
  };
}

async function transformExportsToRemoteFunctions(
  src: string,
  moduleId: string
) {
  await init;

  const [, exports] = parse(src);

  const exportList = exports.map((e) => {
    if (e.n === 'default') {
      return `export default (...args) => client.${moduleId}.${e.n}(...args)`;
    }

    return `export const ${e.n} = (...args) => client.${moduleId}.${e.n}(...args)`;
  });

  return `
    import { createClient } from '#imports'
    const client = createClient()
    
    ${exportList.join('\n')}
  `;
}
