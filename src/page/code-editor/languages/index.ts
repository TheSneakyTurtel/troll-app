import { Language } from "../language.js";
import { TokenizerOptions, TokenType } from "../tokenizer.js";
import cpp, { tokenizerOptions as cppTokenizerOptions } from "./cpp/index.js";

type LanguageEntry = {
	language: Language;
	tokenizerOptions: TokenizerOptions;
};

export default { cpp: { language: cpp, tokenizerOptions: cppTokenizerOptions } } as { cpp: LanguageEntry };

export interface TokenizationState {
	value: StateToken<TokenType>;
	prev: TokenizationState | undefined;
	nextToken: StateToken<TokenType> | undefined;
}

interface StateToken<T extends TokenType> {
	type: T;
	code: string;
	at: number;
	lineIndex: number;
}
