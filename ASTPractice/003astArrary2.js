
// 引用类库
const fs = require('fs');
const parser = require("@babel/parser"); // 将JS代码转为AST
const { error } = require('console');
const traverse = require("@babel/traverse").default; // 遍历AST节点 对AST各个节点的增删改查等操作
const t = require("@babel/types"); // AST节点类型
const generator = require("@babel/generator").default; // 将AST转为JS代码
const { ConfoundUtils, base64Encode } = require("./ConfoundUtils.js");


// 读取原始js代码
const jscode = fs.readFileSync("./dateDemo.js", { encoding: "utf-8" });

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


const jsCodeFont = fs.readFileSync("./ASTPractice/demofont.js", { encoding: "utf-8" });

let astFront = parser.parse(jsCodeFont);

let confoundAst = new ConfoundUtils(ast, base64Encode);

// 改变对象属性访问方式
confoundAst.changeAccessMode();

// 标准内置对象的处理
confoundAst.changeBuiltinObjects();

// 字符串加密与数组混淆
confoundAst.arrayConfound();
// 数组乱序
confoundAst.arrayShuffle();


// 还原数组顺序代码
let confoundAstFont = new ConfoundUtils(astFront, base64Encode);
// 改变独享属性访问方式，对其中的字符串进行十六进制编码
confoundAstFont.stringToHex();
astFront = confoundAstFont.getAst();

// 把还原数组顺序的代码，放到被混淆代码的开头
confoundAst.astConcatUnshift(astFront.program.body[0]);

// 生成数组声明语句，并加入到被混淆代码的开头
confoundAst.unshiftArrayDeclaration();

// 数值常量混淆
confoundAst.numericEncrypt();
ast = confoundAst.getAst();

// 将处理后的AST转为js代码
let code = generator(ast).code;
code = code.replace(/\\\\x/g, "\\x");
//console.log(code);

// 将代码写入新文件
fs.writeFile("./demoNew.js", code, (error) => { });
console.log("AST处理完毕！");