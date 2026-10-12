
// 引用类库
const fs = require('fs');
const parser = require("@babel/parser"); // 将JS代码转为AST
const { error } = require('console');
const traverse = require("@babel/traverse").default; // 遍历AST节点 对AST各个节点的增删改查等操作
const t = require("@babel/types"); // AST节点类型
const generator = require("@babel/generator").default; // 将AST转为JS代码


// 读取原始js代码
const jscode = fs.readFileSync("./demo.js", { encoding: "utf-8" });

// 定义parser配置
let parseConfig = { sourceType: 'script' }; // 默认配置
if (jscode.indexOf('import ') > -1 || jscode.indexOf('export') > -1) {
  parseConfig.sourceType = 'module';
}
/*
parse 方法的第二个参数 默认为 {sourceType:'script'}
当解析的JS代码中含有'import' 'export'等关键字时 需要指定sourceType 为 module
否则会报错 
*/
let ast = parser.parse(jscode, parseConfig);


// 在这里对AST进行一系列的操作

const visitor = {
  ReturnStatement(path) {
    // 当前节点是否有兄弟节点
    // 当容器为数组时，哪怕只有一个节点元素也返回true
    console.log(path.inList);

    // 容器 包含所有同级节点的数组
    console.log(path.container);

    // 容器名称
    console.log(path.listKey);

    // 当前节点在容器中的索引
    console.log(path.key)

    // 根据索引获取容器中的同级节点对象
    // 可以使用 path.key+1 或 path.key-1 来定位下一个 上一个兄弟节点
    console.log(path.getSibling(path.key));


    // 在头部加入代码 参数可以一个对象，或数组
    path.parentPath.unshiftContainer("body", [
      t.expressionStatement(t.stringLiteral("Before1")),
      t.expressionStatement(t.stringLiteral("Before2"))

    ]);

    // 在尾部加入代码 参数可以一个对象，或数组
    path.parentPath.pushContainer("body",
      t.expressionStatement(t.stringLiteral("After"))
    );

  },
  ObjectProperty(path) {
    // ObjectProperty的所有同级节点数组，即容器
    console.log(path.container);
  }
};

traverse(ast, visitor);
// 将处理后的AST转为js代码
let code = generator(ast).code;

console.log(code);

// 将代码写入新文件
fs.writeFile("./demoNew.js", code, (error) => { });

/*
let obj = {
  name: "xiaojianbang",
  add: function (a, b) {
    "xiaojianbang";
    1000;
    return;
  },
  mul: function (a, b) {
    return a * b + 1000;
  }
};
*/