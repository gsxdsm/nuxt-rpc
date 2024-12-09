export function hello({ name }: { name: string }) {
  return Promise.resolve({ message: `Hello ${name}` });
}

export function getTime(name: string) {
  return Promise.resolve({ time: Date.now() });
}
