import { createExtension, createHover, createMarkdownString, message, registerCommand, registerHoverProvider, setCopyText } from '@vscode-use/utils'
import { getStack } from './utils'

export const { activate } = createExtension(() => {
  registerCommand('vscode-json-structure.copyJsonPath', (text: string) => {
    setCopyText(text)
    message.info('JSON path copied to clipboard!')
  })

  registerHoverProvider(['json'],
    (document, position) => {
      // 获取当前选中的文本范围
      const content = document.getText()
      const result = getStack(content, position) ?? ''
      if (!result)
        return

      const md = createMarkdownString()
      md.appendCodeblock(result, 'js')

      // 添加复制按钮
      const copyButton = `[Copy](command:vscode-json-structure.copyJsonPath?${encodeURIComponent(JSON.stringify(result))})`
      md.appendMarkdown(`\n\n${copyButton}`)

      // 启用命令链接
      md.isTrusted = true

      return createHover(md)
    })
})
