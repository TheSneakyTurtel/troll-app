import { Token, TokenType } from "./tokenizer";

export interface Language {
	highlightSyntax(code: string, tokens: Token<TokenType>[]): string;
}
