export function hello({ name }: { name: string }) {
  return { message: `Hello ${name}` };
}

export function getTime(name: string) {
  return new Date().toISOString() + Math.random();
}
