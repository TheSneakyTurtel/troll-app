import { Editor } from "./code-editor/editor.js";

const codeEditor = new Editor(document.getElementById("code-editor"), {
	language: "cpp",
	initialInput: `
#include <iostream>

int main() {
	std::cout << "Hello World!";
	return 0;
}
`,
});

function executeCPP(cpp: string) {
	window.dispatchEvent(new CustomEvent("execute-cpp", { detail: { sourceCode: cpp } }));
}
