import type * as vscode from 'vscode'

// eslint-disable-next-line ts/no-require-imports
const parse = require('json-to-ast')

export function getStack(content: string, position: vscode.Position) {
  const ast = parse(content, {
    loc: true,
  })
  const allJsonLoc = ast.loc
  const { start, end } = allJsonLoc
  const { line } = position
  if (line < start.line || line > end.line)
    return
  const { children } = ast
  if (!children)
    return

  const stack: Array<[string | number, string]> = findTarget(children, position)
  if (!stack || stack.length === 0)
    return ''

  const isIdentifier = (s: string) => /^[A-Z_$][\w$]*$/i.test(s)

  // Build a JS-safe access path. Examples:
  // - a.b[0].c
  // - a["@antfu/eslint-config"].x
  let result = ''
  for (let i = 0; i < stack.length; i++) {
    const [name] = stack[i]

    // array index (number) -> [0]
    if (typeof name === 'number' || /^\d+$/.test(String(name))) {
      result += `[${name}]`
      continue
    }

    const key = String(name)
    if (isIdentifier(key)) {
      result += result === '' ? key : `.${key}`
    }
    else {
      // Use JSON.stringify to correctly escape the key, then wrap in brackets.
      // JSON.stringify uses double quotes; that's valid JS (a["b"]).
      const quoted = JSON.stringify(key)
      result += `[${quoted}]`
    }
  }

  return result
}

function findTarget(children: any, position: any, stack: any = []) {
  const line = position.line + 1
  let i = -1
  for (const child of children) {
    i++
    const { start, end } = child.loc
    if (start.line > line || line > end.line)
      continue
    const { type } = child
    if (type === 'Property') {
      stack.push([child.key.value, child.value.type])
      if (line === child.key.loc.start.line)
        return stack
      const { value } = child
      if (line >= value.loc.start.line && line <= value.loc.end.line)
        return findTarget(value.children, position, stack)
    }
    else {
      stack.push([i, child.type])
      return findTarget(child.children, position, stack)
    }
  }
  return stack
}
