
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

        // // 以下获取的是节点
        // console.log(path.node.left);
        // console.log(path.node.right);
        // console.log(path.node.operator);

        // //以下方式获取的是Path，这样才能使用path里面的方法
        // console.log(path.get("left.name"));
        // console.log(path.get("right"));
        // console.log(path.get("operator"));

        console.log(path.get("left").isIdentifier());
        console.log(path.get("right").isNumericLiteral({ value: 1000 }));
        try {
            path.get("left").assertIdentifier();
        } catch (ex) {
            console.log("当前path不是Identifier")
        }

    }
};

traverse(ast, visitor);
// 将处理后的AST转为js代码
let code = generator(ast).code;

console.log(code);

// 将代码写入新文件
fs.writeFile("./demoNew.js", code, (error) => { });