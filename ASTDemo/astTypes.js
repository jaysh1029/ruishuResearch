
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
    // enter(path) {
    //     if (path.node.type === "Identifier" &&
    //         path.node.name === "a") {
    //         path.node.name = "x";
    //     }
    // }

    // 也可以用以下方式判断node的类型 
    // 第二个参数 判断节点名称是否为a
    enter(path) {

        // if (t.isIdentifier(path.node, { name: "a" })) {
        //     path.node.name = "y";
        // }

        // 也可以用 path.isIdentifier({ name: "a" })
        if (path.isIdentifier({ name: "a" })) {
            path.node.name = "y";
        }


    }
};

traverse(ast, visitor);
// 将处理后的AST转为js代码
let code = generator(ast).code;

console.log(code);

// 将代码写入新文件
fs.writeFile("./demoNew.js", code, (error) => { });