
import * as vscode from 'vscode';
import { reduxCodeGenerator } from './lib/redux_code_generator';

export function activate(context: vscode.ExtensionContext) {

	console.log('redux-code-gen extension active!');

	const disposable = vscode.commands.registerCommand('ninesuns.reduxCodeGen', async (param) => {

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

		reduxCodeGenerator({ baseDir, actionPrefix: prefix!, key: key!, payload: payload!, saga: isSaga === 'saga' });
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
