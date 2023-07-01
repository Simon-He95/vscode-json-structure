import fsp from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { getStack } from '../src/utils'

describe('should', () => {
  it('exported', async () => {
    const data = await fsp.readFile('./test/test.json', 'utf-8')
    expect(getStack(data, {
      line: 10,
      character: 3,
    } as any)).toMatchInlineSnapshot('"children[0].children[1].name"')
  })
})
