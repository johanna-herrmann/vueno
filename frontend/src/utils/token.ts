const TOKEN_PATTERN = /^[a-zA-Z0-9_-]{11}\.[a-zA-Z0-9_-]{11}$/

export function isValidToken(token: string | null | undefined): boolean {
  return typeof token === 'string' && TOKEN_PATTERN.test(token)
}
