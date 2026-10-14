
// 引用类库
const fs = require('fs');
const parser = require("@babel/parser"); // 将JS代码转为AST
const { error } = require('console');
const traverse = require("@babel/traverse").default; // 遍历AST节点 对AST各个节点的增删改查等操作
const t = require("@babel/types"); // AST节点类型
const generator = require("@babel/generator").default; // 将AST转为JS代码


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
function base64Encode(e) {
    var r, a, c, h, o, t, base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    for (c = e.length, a = 0, r = ''; a < c;) {
        if (h = 255 & e.charCodeAt(a++), a == c) {
            r += base64EncodeChars.charAt(h >> 2),
                r += base64EncodeChars.charAt((3 & h) << 4),
                r += '==';
            break
        }
        if (o = e.charCodeAt(a++), a == c) {
            r += base64EncodeChars.charAt(h >> 2),
                r += base64EncodeChars.charAt((3 & h) << 4 | (240 & o) >> 4),
                r += base64EncodeChars.charAt((15 & o) << 2),
                r += '=';
            break
        }
        t = e.charCodeAt(a++),
            r += base64EncodeChars.charAt(h >> 2),
            r += base64EncodeChars.charAt((3 & h) << 4 | (240 & o) >> 4),
            r += base64EncodeChars.charAt((15 & o) << 2 | (192 & t) >> 6),
            r += base64EncodeChars.charAt(63 & t)
    }
    return r
}

traverse(ast, {
    MemberExpression(path) {
        if (t.isIdentifier(path.node.property)) {
            let name = path.node.property.name;
            path.node.property = t.stringLiteral(name);
        }
        path.node.computed = true;
    },
    Identifier(path) {
        let name = path.node.name;
        if ('|eval|parseInt|encodeURIComponent|Object|Function|Boolean|Number|Math|Date|String|RegExp|Array|'.indexOf(`|${name}|`) != -1) {

            path.replaceWith(t.memberExpression(t.identifier('window'), t.stringLiteral(name), true));
        }
    },
    NumericLiteral(path) {
        let val = path.node.value;
        let key = parseInt(Math.random() * (999999 - 100000) + 100000, 10);
        let ciperNum = val ^ key;
        path.replaceWith(t.binaryExpression('^', t.numericLiteral(ciperNum), t.numericLiteral(key)));
        // 替换后要跳过，否则会陷入死循环
        path.skip();
    },
    StringLiteral(path) {
        let encStr = t.callExpression(
            t.identifier("atob"),
            [t.stringLiteral(base64Encode(path.node.value))]
        );
        path.replaceWith(encStr);
        path.skip();
    }

});
// 将处理后的AST转为js代码
let code = generator(ast).code;

//console.log(code);

// 将代码写入新文件
fs.writeFile("./demoNew.js", code, (error) => { });