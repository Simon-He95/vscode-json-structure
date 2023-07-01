import type * as vscode from 'vscode'

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
  const stack: [string, string][] = findTarget(children, position)
  return stack.reduce((result: string, [name, val], i) => {
    if (val === 'Array')
      result += 'children['
    else if (val === 'Object')
      result += `${name}${result.slice(-1)[0] === '[' ? ']' : ''}${i !== stack.length - 1 ? '.' : ''}`
    else
      result += name

    return result
  }, '')
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
