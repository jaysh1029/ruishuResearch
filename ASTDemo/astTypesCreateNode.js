
// 引用类库
const fs = require('fs');
const parser = require("@babel/parser"); // 将JS代码转为AST
const { error } = require('console');
const traverse = require("@babel/traverse").default; // 遍历AST节点 对AST各个节点的增删改查等操作
const t = require("@babel/types"); // AST节点类型
const generator = require("@babel/generator").default; // 将AST转为JS代码


let a = t.identifier("a");
let b = t.identifier("b");
let number = t.numericLiteral(1000);
let binExpr2 = t.binaryExpression("+", a, b);
let binExpr3 = t.binaryExpression("*", a, b);

let retSta2 = t.returnStatement(t.binaryExpression("+", binExpr2, number));
let retSta3 = t.returnStatement(t.binaryExpression("+", binExpr3, number));

let bloSta2 = t.blockStatement([retSta2]);
let bloSta3 = t.blockStatement([retSta3]);
let func2 = t.functionExpression(null, [a, b], bloSta2);
let func3 = t.functionExpression(null, [a, b], bloSta3);

let objPropName = t.objectProperty(t.identifier("name"), t.stringLiteral("xiaojianbang"));
let objPropFunc2 = t.objectProperty(t.identifier("add"), func2);
let objPropFunc3 = t.objectProperty(t.identifier("mul"), func3);

let objExpr = t.objectExpression([objPropName, objPropFunc2, objPropFunc3]);

let varDec = t.variableDeclarator(t.identifier("obj"), objExpr);

let ast = t.variableDeclaration("let", [varDec]);



let code = generator(ast).code;

console.log(code);

// 将代码写入新文件
fs.writeFile("./demoNew.js", code, (error) => { });