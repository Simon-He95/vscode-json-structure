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

  it('handles special keys', async () => {
    const json = `{
  "normal": { "a": 1 },
  "@antfu/eslint-config": { "x": 2 },
  "a-b": 3,
  "arr": [ { "inner-key": 4 } ]
}`

    // position inside @antfu/eslint-config.x (line numbers are 0-based in getStack's callers)
    const pos1 = { line: 2, character: 5 } as any
    // When the cursor is on the property key line the current algorithm
    // returns the parent property only (doesn't descend into its children).
    expect(getStack(json, pos1)).toBe('["@antfu/eslint-config"]')

    // position inside a-b key (line 3)
    const pos2 = { line: 3, character: 5 } as any
    expect(getStack(json, pos2)).toBe('["a-b"]')

    // inside array inner-key (line 4) - current algorithm returns parent property
    const pos3 = { line: 4, character: 20 } as any
    expect(getStack(json, pos3)).toBe('arr')
  })
})
