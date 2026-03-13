import { randomUUID as nodeRandomUUID } from 'crypto';

export function randomUUID(): string {
  return nodeRandomUUID();
}
