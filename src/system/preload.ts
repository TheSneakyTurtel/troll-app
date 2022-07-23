import * as childProcess from "child_process";
import * as fs from "fs/promises";
import * as path from "path";

async function manageCPPProcess(cppProcess: childProcess.ChildProcessWithoutNullStreams) {
	cppProcess.stdout.on("data", data => {
		// const message = new TextDecoder().decode(data);

		console.log(data);
	});

	cppProcess.stdout.pipe(process.stdout);

	cppProcess.stdin.setDefaultEncoding("utf-8");
	cppProcess.stdin.write("hello\n");
}

async function executeCPP(cpp: string) {
	const cppFile = path.join(__dirname, "temp.cpp");
	const outputFile = path.join(__dirname, "temp.exe");

	await fs.writeFile(cppFile, cpp);

	const compileProcess = childProcess.exec(`g++ "${cppFile}" -o "${outputFile}"`, compileError => {
		compileProcess.kill();

		manageCPPProcess(childProcess.execFile(outputFile));
	});
}

window.addEventListener("execute-cpp", async (ev: CustomEvent<{ sourceCode: string }>) => executeCPP(ev.detail.sourceCode));
