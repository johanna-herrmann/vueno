import { describe, expect, it } from 'vitest'
import { isValidToken } from '../src/utils/token'

describe('isValidToken', () => {
  it('accepts two 11-character URL-safe token parts', () => {
    expect(isValidToken('Dsnmn7Twqd1.j8yZ15Ji210')).toBe(true)
  })

  it.each([null, undefined, '', 'short.token', 'Dsnmn7Twqd1.j8yZ15Ji21!', 'Dsnmn7Twqd1.j8yZ15Ji210.extra'])('rejects invalid token %s', (token) => {
    expect(isValidToken(token)).toBe(false)
  })
})
