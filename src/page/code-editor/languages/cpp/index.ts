import { Language } from "../../language.js";
import { Token, TokenizerOptions, TokenType } from "../../tokenizer.js";
import { TokenizationState } from "../index.js";
import keywords from "./keywords.js";
import types from "./types.js";

const getTokenCode = (code: string, token: Token<TokenType>) => (token.length ? code.slice(token.at, token.at + token.length) : code[token.at]);
const getTokenLineIndex = (code: string, token: Token<TokenType>) => code.slice(0, token.at).split("\n").length - 1;

function isKeyword(state: TokenizationState): boolean {
	if ((state.value.code === "include" || state.value.code === "define") && state.prev?.value.type === TokenType.Hash && state.prev?.value.at + 1 === state.value.at) return true;

	return !!keywords[state.value.code];
}

function isLibrary(state: TokenizationState) {
	return (
		(state.nextToken?.code === ">" &&
			state.prev?.value.code === "<" &&
			state.prev?.prev?.value.type === TokenType.Whitespace &&
			state.prev?.prev?.prev?.value.code === "include" &&
			state.prev?.prev?.prev?.prev?.value.code === "#") ||
		(state.prev?.value.type === TokenType.Whitespace && state.prev?.prev?.value.code === "namespace")
	);
}

function toHTMLEntityIfNeeded(char: string): string {
	return char === "\t" ? "&nbsp; &nbsp;" : char === "\n" ? "<br />" : char === " " ? "&nbsp;" : char === "<" ? "&lt;" : char === ">" ? "&gt;" : char;
}

const cpp: Language = {
	highlightSyntax(code: string, tokens: Token<TokenType>[]) {
		let output = "";
		let state: TokenizationState | undefined;

		const highlightSyntax = (codePiece: string, className: string) => `<span class="${className}">${codePiece}</span>`;

		for (let i = 0; i < tokens.length; i++) {
			state = {
				prev: state,
				value: { type: tokens[i].type, code: getTokenCode(code, tokens[i]), at: tokens[i].at, lineIndex: getTokenLineIndex(code, tokens[i]) },
				nextToken:
					i + 1 < tokens.length
						? { type: tokens[i + 1].type, code: getTokenCode(code, tokens[i + 1]), at: tokens[i + 1].at, lineIndex: getTokenLineIndex(code, tokens[i + 1]) }
						: undefined,
			};

			switch (state.value.type) {
				case TokenType.Dot:
				case TokenType.Comma:
				case TokenType.Semicolon:
				case TokenType.Operator:
					output +=
						(state.value.code === "*" && (state.prev?.value.type === TokenType.Identifier || state.nextToken?.type === TokenType.Identifier)) ||
						(state.value.code === "&" && state.nextToken?.type === TokenType.Identifier)
							? highlightSyntax(toHTMLEntityIfNeeded(state.value.code), "pointer-indicator")
							: toHTMLEntityIfNeeded(state.value.code);
					break;
				case TokenType.Char:
				case TokenType.String:
					output += highlightSyntax(state.value.code, "string");
					break;
				case TokenType.Identifier:
					if (state.nextToken?.code === "(") output += highlightSyntax(state.value.code, "function");
					else if (isLibrary(state)) output += highlightSyntax(state.value.code, "library");
					else if (isKeyword(state)) output += highlightSyntax(state.value.code, "keyword");
					else if (types[state.value.code]) output += highlightSyntax(state.value.code, "type");
					else output += highlightSyntax(state.value.code, "variable");
					break;
				case TokenType.Number:
					output += highlightSyntax(state.value.code, "number");
					break;
				case TokenType.Comment:
					output += highlightSyntax(state.value.code, "comment");
					break;
				case TokenType.Ignored:
					output += highlightSyntax(toHTMLEntityIfNeeded(state.value.code), "unexpected");
					break;
				default:
					output += toHTMLEntityIfNeeded(state.value.code);
					break;
			}
		}

		return output;
	},
};

export const tokenizerOptions: TokenizerOptions = {
	unknownCharacterBehaviour: "ignore",
	commentPrefix: "//",
};

export default cpp;
