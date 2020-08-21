
import * as fs from 'fs';
import { dirname } from 'path';
import {
  space4,
  capitalize,
  appendFilerStr
} from './common/helper';
import {
  getActionKeyFilePath,
  getActionCreatorFilePath,
  getActionPayloadFilePath,
  getReducerFilePath,
  getSagaFilePath
} from './common/file_path_helper';
import {
  enumRegExp,
  insertToEnum,
  getEnumName,
  getInsertActionKeyContent
} from './action_key/helper';
import { getInsertActionCreatorContent, getActionPayloadFileContent } from './action_creator/helper';
import { getReducerFileContent, insertNewReducerHandler } from './reducer/helper';
import { getSagaFileContent, getInsertSagaHandlerContent } from './saga/helper';

export async function reduxCodeGenerator(
  { baseDir = `${process.cwd()}`, actionPrefix, key, payload, saga = false }: {
    baseDir?: string;
    actionPrefix: string;
    key: string;
    payload: string;
    saga: boolean
  },
) {

  /** insert action key */
  const keyFilePath = getActionKeyFilePath(baseDir, actionPrefix);
  insertOrCreate(keyFilePath, {
    insertCallback: () => insertKey(keyFilePath, { prefix: actionPrefix, key }),
    createCallback: () => createKeyFile(keyFilePath, { prefix: actionPrefix, key})
  });

  /** insert action creator */
  const actionCreatorFilePath = getActionCreatorFilePath(baseDir, actionPrefix);
  insertOrCreate(actionCreatorFilePath, {
    insertCallback: () => insertActionCreator(actionCreatorFilePath, { prefix: actionPrefix, key, payload }),
    createCallback: () => createActionCreatorFile(actionCreatorFilePath, { prefix: actionPrefix, key, payload })
  });
  /** insert action payload */
  const actionPayloadFilePath = getActionPayloadFilePath(baseDir, actionPrefix);
  insertOrCreate(actionPayloadFilePath, {
    insertCallback: () => Promise.resolve(),
    createCallback: () => createActionPayloadFile(actionPayloadFilePath, actionPrefix)
  });
  if (!saga) {
    /** insert reducer */
    const reducerFilePath = getReducerFilePath(baseDir, actionPrefix);
    insertOrCreate(reducerFilePath, {
      insertCallback: () => insertReducerFile(reducerFilePath, { prefix: actionPrefix, key }),
      createCallback: () => createReducerFile(reducerFilePath, { prefix: actionPrefix, key })
    });
  } else {
    /** insert saga */
    const sagaFilePath = getSagaFilePath(baseDir, actionPrefix);
    insertOrCreate(sagaFilePath, {
      insertCallback: () => insertSagaFile(sagaFilePath, { prefix: actionPrefix, key }),
      createCallback: () => createSagaFile(sagaFilePath, { prefix: actionPrefix, key })
    });
  }

}

/**
 * 文件存在则调用 insertCallback
 * 文件不存在则调用 createCallback
 */
function insertOrCreate(path: string, { insertCallback, createCallback }: { insertCallback: () => Promise<void>; createCallback: () => Promise<void> }) {
  fs.open(path, 'wx', (error, fd) => {
    if (error) {
      if (error.code === 'EEXIST') {
        insertCallback();
      } else if (error.code === 'ENOENT') {
        // 对应目录不存在
        const dirName = dirname(path);
        fs.mkdirSync(dirName, { recursive: true });
        createCallback();
      }
    } else {
      createCallback();
    }
  });
}

/**
 * 在 key file 存在的前提下 插入新的 key
 */
async function insertKey(keyFilePath: string, opt: { prefix: string; key: string; }) {
  const insertContent = getInsertActionKeyContent(opt.prefix, opt.key);
  const enumName = getEnumName(keyFilePath);
  return new Promise<void>((resolve, reject) => {
    fs.readFile(keyFilePath, { encoding: 'utf8' }, (error, data) => {
      if (error) {
        reject(error);
      } else {
        if (enumRegExp(enumName).test(data)) {
          console.log("在现有文件 %s 中插入 Key: %s", keyFilePath, capitalize(opt.key));
          fs.writeFile(keyFilePath, insertToEnum(data, enumName, insertContent), { encoding: 'utf8' }, (error) => {
            if (error) {
              reject(error);
            }
            resolve();
          });
        } else {
          reject(new Error('不识别的Key文件格式'));
        }
      }
    });
  });
}

function createKeyFile(keyFilePath: string, opt: { prefix: string; key: string; }) {
  console.log('创建新的 action key 文件: ', keyFilePath);
  const insertContent = getInsertActionKeyContent(opt.prefix, opt.key);
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(
      keyFilePath,
      `export enum ${getEnumName(keyFilePath)} {\n${space4}${insertContent}\n}\n`,
      { encoding: 'utf8' },
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
}

async function insertActionCreator(
  path: string,
  opt: { prefix: string; key: string; payload: string }
) {
  console.log('在现有文件 %s 中插入 action creator: %s', path, opt.key);
  return appendFilerStr(path, getInsertActionCreatorContent(opt));
}

function createActionCreatorFile(
  path: string,
  opt: { prefix: string; key: string; payload: string }
) {
  console.log('创建新的 action 文件', path);
  /** 下面的代码 请不要格式化 */
  const actionCreatorFileTpl = "import { #prefix#ActionKey } from './#_prefix#ActionKey';\n#content#";

  const insertActionCreatorContent = getInsertActionCreatorContent(opt);
  const prefix = opt.prefix;
  const newActionCreator = actionCreatorFileTpl
                              .replace(/#_prefix#/g, prefix)
                              .replace(/#prefix#/g, capitalize(prefix))
                              .replace(/#content#/g, insertActionCreatorContent);
  
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(path, newActionCreator, { encoding: 'utf8' }, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function createActionPayloadFile(path: string, prefix: string) {
  console.log('创建新的 action payload 文件', path);
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(path, getActionPayloadFileContent(prefix), { encoding: 'utf8' }, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function createReducerFile(path: string, opt: { prefix: string; key: string }) {
  console.log('创建新的 action reducer 文件', path);
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(path, getReducerFileContent(opt.prefix, opt.key), { encoding: 'utf8' }, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function insertReducerFile(path: string, opt: { prefix: string; key: string }) {
  console.log('在现有文件 %s 中插入 reducer handler: %s', path, `${opt.key}Handler`);
  return new Promise<void>((resolve, reject) => {
    fs.readFile(path, { encoding: 'utf8' }, (error, dataExisted) => {
      if (error) {
        reject(error);
      } else {
        fs.writeFile(path, insertNewReducerHandler(dataExisted, opt), { encoding: 'utf8' }, (error) => {
          if (error) {
            throw error;
          }
          resolve();
        });
      }
    });
  });
}

async function createSagaFile(path: string, opt: { prefix: string; key: string }) {
  console.log('创建新的 saga 文件', path);
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(path, getSagaFileContent(opt.prefix, opt.key), { encoding: 'utf8' }, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function insertSagaFile(path: string, opt: { prefix: string; key: string }) {
  console.log('在现有文件 %s 中插入 saga handler: %s', path, `${opt.key}Saga`);
  return appendFilerStr(path, getInsertSagaHandlerContent(opt.prefix, opt.key));
}
