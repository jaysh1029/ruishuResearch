
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
  BinaryExpression(path) {

    // 获取父节点
    let node = path.parent;
    // 获取父级path
    let parentPath = path.parentPath;

    // 等价关系 parent是parentPath中的一部分
    console.log(path.parent === path.parentPath.node);

  },
  ReturnStatement(path) {

    // 向上遍历满足条件的节点 
    // 遍历时 不包含当前节点
    // 找不到时 返回null
    console.log(path.findParent((p) => p.isObjectExpression()));

    // 上一句等价与下面这句代码
    // console.log(path.findParent(function (p) {
    //     return p.isObjectExpression();
    // }));

    // 功能更上面的path.findParent功能一样，只是遍历时 会包含当前节点
    // 找不到时 返回null
    console.log(path.find((p) => p.isObjectExpression()));



    // 向上查找与当前最接近的父函数
    let recentFunc = path.getFunctionParent();

    // 向上遍历 直到找到语句父节点
    let recentStatement = path.getStatementParent();


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