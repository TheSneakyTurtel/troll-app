const operators = "=+-*/%<>!&|^~";
const enclosureStarts = "({[";
const enclosureEnds = ")}]";

export function tokenize(input: string, options: TokenizerOptions): Token<TokenType>[] {
	let current = 0;
	const tokens: Token<TokenType>[] = [];

	function finishToken<T extends TokenType>(tokenType: T, isValidChar: () => boolean, ignoreFirst?: boolean): Token<T> {
		const at = current;

		if (ignoreFirst)
			do {
				current++;
			} while (current < input.length && isValidChar());
		else while (current < input.length && isValidChar()) current++;

		return at + 1 < current ? { at, length: current - at, type: tokenType } : { at, type: tokenType };
	}

	function finishLiteral<T extends TokenType.Char | TokenType.String>(tick: T extends TokenType.Char ? "'" : '"'): Token<T> {
		const { at, type } = finishToken<T>((tick === "'" ? TokenType.Char : TokenType.String) as T, () => input[current] !== tick, true);
		input[current] === tick && current++; // consume the closing tick

		return { at, length: current - at, type };
	}

	function handleUnknownChar() {
		if (options.unknownCharacterBehaviour !== "throw-error") tokens.push({ at: current++, type: TokenType.Ignored });
		else throw new Error(`Unknown character: ${input[current]}`);
	}

	while (current < input.length) {
		if (input.slice(current, current + options.commentPrefix.length) === options.commentPrefix) {
			const at = current;

			current += options.commentPrefix.length;
			while (current < input.length && input[current] !== "\n") current++;

			tokens.push({ at, length: current - at, type: TokenType.Comment });
			current++;
			continue;
		}

		if (isNumber(input[current])) tokens.push(finishToken(TokenType.Number, () => isNumber(input[current])));
		else if (isAlpha(input[current])) tokens.push(finishToken(TokenType.Identifier, () => !getCharacterType(input[current], options) && isAlpha(input[current])));
		else if (input[current] === "'" || input[current] === '"') tokens.push(finishLiteral(input[current] as "'" | '"'));
		else {
			const charType = getCharacterType(input[current], options);

			if (charType) {
				tokens.push({ at: current, type: charType });
				current++;
			} else handleUnknownChar();
		}
	}

	return tokens;
}

const isAlpha = (char: string) => /[a-zA-Z_]/.test(char);
const isWhitespace = (char: string) => /\s/.test(char);
const isNumber = (char: string) => /[0-9]/.test(char);

function getCharacterType(char: string, options: TokenizerOptions) {
	return enclosureStarts.includes(char)
		? TokenType.EnclosureStart
		: enclosureEnds.includes(char)
		? TokenType.EnclosureEnd
		: operators.includes(char)
		? TokenType.Operator
		: char === "\t"
		? options.includeIndentation === false
			? undefined
			: TokenType.Indentation
		: char === "\n"
		? options.includeNewlines === false
			? undefined
			: TokenType.Newline
		: isWhitespace(char)
		? options.includeWhitespace === false
			? undefined
			: TokenType.Whitespace
		: char === "."
		? TokenType.Dot
		: char === ","
		? TokenType.Comma
		: char === ":"
		? TokenType.Colon
		: char === ";"
		? TokenType.Semicolon
		: char === "#"
		? TokenType.Hash
		: undefined;
}

export interface TokenizerOptions {
	unknownCharacterBehaviour: "throw-error" | "ignore";
	commentPrefix: string;
	includeWhitespace?: boolean;
	includeNewlines?: boolean;
	includeIndentation?: boolean;
}

export enum TokenType {
	Function = "function",
	Identifier = "identifier",
	Number = "number",
	Operator = "operator",
	String = "string",
	Char = "char",
	EnclosureStart = "enclosure-start",
	EnclosureEnd = "enclosure-end",
	Comment = "comment",
	Ignored = "ignored",
	Hash = "hash",
	Dot = "dot",
	Comma = "comma",
	Colon = "colon",
	Semicolon = "semicolon",
	Whitespace = "whitespace",
	Indentation = "indentation",
	Newline = "newline",
}

export type Token<Type extends TokenType> = { at: number; length?: number; type: Type };
