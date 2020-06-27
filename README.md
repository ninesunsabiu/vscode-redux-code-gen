# vscode-redux-code-gen
之前趁着 deno 1.0 发布的时候，用它写了一个生成项目内 redux 模板代码的脚本小工具: [redux-code-gen](https://github.com/ninesunsabiu/redux-code-gen)  

但是日常使用中通常是写在记事本中，需要的时候改完在粘贴回 terminal 中执行  这样多少有点麻烦  

于是萌生了利用了 vs code extension 机制做一款插件，插件中利用 vscode.window 的一些 API 做简单的 UI，方便使用  

直接在 Explorer 中文件夹的右键增加入口，就在该目录下生成对应的 redux 代码。  具体的生成逻辑是直接调用的 redux-code-gen 脚本