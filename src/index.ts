import * as vscode from 'vscode'
import { getStack } from './utils'

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.languages.registerHoverProvider(['json'], {
    provideHover(document, position) {
      // 获取当前选中的文本范围
      const content = document.getText()
      const result = getStack(content, position) ?? ''
      const md = new vscode.MarkdownString()
      md.appendCodeblock(result, 'js')
      return new vscode.Hover(md)
    },
  }))
}

export function deactivate() {

}
