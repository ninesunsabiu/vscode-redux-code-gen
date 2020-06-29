
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('redux-code-gen extension active!');

	let disposable = vscode.commands.registerCommand('ninesuns.reduxCodeGen', async (param) => {

		const config = vscode.workspace.getConfiguration('reduxCodeGen');
		
		const folderPath = param?.fsPath as string | undefined;
		
		const pathRegex = /^(.*)\/(.*)$/;

		const baseDir = folderPath?.replace(pathRegex, '$1') ?? config.get('baseDir');

		const key = await vscode.window.showInputBox({ prompt: 'redux action key' });
		const payload = await vscode.window.showInputBox({ prompt: 'action payload' });
		const isSaga = await vscode.window.showQuickPick(
			['saga', 'reducer'],
			{
				canPickMany: false,
				matchOnDescription: true,
				matchOnDetail: true
			}
		);

		let prefix = folderPath?.replace(pathRegex, '$2');
		if (!prefix) {
			prefix = await vscode.window.showInputBox({ prompt: 'for module' });
		}

		if (
			[baseDir, prefix, key, payload, isSaga].some((val) => val === undefined)
		) {
			// 可能被取消 就终止接下来的行为了
			return;
		}
		
		const codeGenTask = new vscode.Task(
			{ type: 'deno' },
			vscode.TaskScope.Workspace,
			'redux-code-gen',
			'deno',
			new vscode.ShellExecution(
`deno run --allow-read --allow-write --allow-net \
https://raw.githubusercontent.com/ninesunsabiu/redux-code-gen/master/redux_code_generator.ts \
--action-prefix=${prefix} \
--key=${key} \
--payload='${payload}' \
--baseDir=${baseDir} \
--saga=${isSaga === 'saga'}`
			)
		);

		vscode.tasks.executeTask(codeGenTask);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
