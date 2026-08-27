/*
    babel AST处理js代码
    运行环境：NodeJS
    安装插件：
        1. npm install @babel/parser    // 将js代码转为AST
        2. npm install @babel/traverse  // 遍历AST节点，并对相关节点进行增删改查处理
        3. npm install @babel/types     // AST节点类型支持 判断节点类型，生成新的节点
        4. npm install @babel/generator // 把AST转为js代码

    官方文档：https://babeljs.io/docs/
    github手册：
        中文:https://github.com/jamiebuilds/babel-handbook/tree/master/translations/zh-Hans
        英文:https://github.com/jamiebuilds/babel-handbook/tree/master/translations/en
    AST规范：https://github.com/babel/babel/blob/main/packages/babel-parser/ast/spec.md

    快捷使用指南：
        若要了解某个方法或属性的用法，可以按着Ctrl用鼠标左键点击相应方法或属性
        即可跳转到本地ts文档，查看具体参数及类型

*/

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


// 在这里对AST进行一系列操作


/*
    traverse 要配合visitor参数来进行过滤
    let visitor = {};
    // traverse在遍历节点时，若遇到节点类型为 FunctionDeclaration 时 就会执行 下面的function 
    // 参数为AST节点path    
    visitor.FunctionDeclaration = function(path){
        console.log('处理FunctionDeclaration节点');
    }
    // 若要处理其他节点 如 Identifier 可以在visitor中继续定义方法，以Identifier命名即可
    visitor.Identifier = function(path){
        console.log('处理Identifier节点');
    }
    traverse(ast,visitor); // 遍历ast的每一个节点，使用visitor作为过滤，对相关节点处理

    visitor还可以这样定义 
    const visitor = {
        FunctionDeclaration:{
            enter(path){
                console.log('进入节点时处理');
            },
            exit(path){
                console.log('退出节点时处理');
            }
        }
    }

    

*/

// 内部visitor
const updateParamNameVisitor = {
    Identifier(path) {
        // this.paramName 由调用方法传入
        if (path.node.name === this.paramName) { // 把代码中所有函数的第一个参数名字改为x
            path.node.name = 'x';
        }
    }
};

const visitor = {
    Identifier(path) {
        console.log('处理Identifier 节点');
    }
    ,
    FunctionDeclaration: { // 这里 FunctionDeclaration 是一个{}对象 不是function
        enter(path) {
            console.log('进入节点时处理');
            const paramName = path.node.params[0].name;
            // traverse 可以在任意节点下继续向下遍历
            path.traverse(updateParamNameVisitor, { paramName });// 把代码中所有函数的第一个参数名字改为x
        },
        exit(path) {
            console.log('退出节点时处理');
        }
    },
    BlockStatement(path) {        
        console.log('处理blockstatement节点');
    },
    "BinaryExpression|NumericLiteral"(path) { // 可以用同一个function处理不同的节点
        console.log('同时处理BinaryExpression和NumericLiteral节点');
    },
    ReturnStatement: { // 这里ReturnStatement 是一个{}对象 不是function
        enter: [func1, func2], // 可以给enter或exit赋值为一个函数数组，会依次执行里面的函数
        exit: [func3, func4]
    }


}
function func1() { }
function func2() { }
function func3() { }
function func4() { }
// 遍历ast所有节点，visitor为需要过滤出需要处理的节点类型对象
traverse(ast, visitor);






// 将处理后的AST转为js代码
let code = generator(ast).code;

// 将代码写入新文件
fs.writeFile('./demoNew.js', code, (err) => { });


// 可以通过types组件生成节点，进而生成代码
// 创建variableDeclarator节点
let varDec = t.variableDeclarator(t.identifier('id'), t.numericLiteral(1029));
// 创建变量节点
let localAst = t.variableDeclaration('let', [varDec]);

console.log(generator(localAst).code);
