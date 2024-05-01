export class PromptGenerator {
  private constructor(private prompt: string) {}

  static generate(): PromptGenerator {
    return new PromptGenerator('')
  }

  insertEmptyLine(): this {
    this.prompt += '\n'
    return this
  }

  insertLine(text: string): this {
    this.prompt += text + '\n'
    return this
  }

  insertLineAsBold(text: string): this {
    return this.insertLine(`**${text}**`)
  }

  insertCode(code: string, codeLanguage?: string): this {
    const leading = '```' + (codeLanguage || '') + '\n'
    const trailing = '\n```'

    return this.insertLine(leading + code + trailing)
  }

  insertLineWhen(
    condition: () => boolean,
    text: (() => string) | string
  ): this {
    if (condition()) {
      return this.insertLine(typeof text === 'function' ? text() : text)
    }
    return this
  }

  toString(): string {
    return this.prompt
  }
}
