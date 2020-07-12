import { resolve, dirname, isAbsolute } from 'path';
import * as vscode from 'vscode';

function pathResolve(baseDir: string, filename: string) {
  if (isAbsolute(baseDir)) {
    return resolve(baseDir, filename);
  }
  const workspaceFolders = vscode.workspace.workspaceFolders;
  return resolve(workspaceFolders?.[0].uri.path?? '.', baseDir, filename);
}

export function getReduxSuitCommonFilePath(baseDir: string, prefix: string) {
  return pathResolve(baseDir, prefix);
}

export function getActionKeyFilePath(baseDir: string, prefix: string) {
  return pathResolve(getReduxSuitCommonFilePath(baseDir, prefix), `${prefix}ActionKey.ts`);
}

export function getActionCreatorFilePath(baseDir: string, prefix: string) {
  return pathResolve(getReduxSuitCommonFilePath(baseDir, prefix), `${prefix}Action.ts`);
}

export function getReducerFilePath(baseDir: string, prefix: string) {
  return pathResolve(getReduxSuitCommonFilePath(baseDir, prefix), `${prefix}Reducer.ts`);
}

export function getSagaFilePath(baseDir: string, prefix: string) {
  return pathResolve(getReduxSuitCommonFilePath(baseDir, prefix), `${prefix}Saga.ts`);
}

export function getActionPayloadFilePath(baseDir: string, prefix: string) {
  return pathResolve(getReduxSuitCommonFilePath(baseDir, prefix), `${prefix}ActionPayload.ts`);
}

export { dirname };
