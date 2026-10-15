
// 引用类库
const fs = require('fs');
const parser = require("@babel/parser"); // 将JS代码转为AST
const { error } = require('console');
const traverse = require("@babel/traverse").default; // 遍历AST节点 对AST各个节点的增删改查等操作
const t = require("@babel/types"); // AST节点类型
const generator = require("@babel/generator").default; // 将AST转为JS代码

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



/**
 * AST混淆处理类
 * @param ast 解析好的AST对象
 * @param encryptFunc 加密函数，用来加密字符串
 */
function ConfoundUtils(ast, encryptFunc) {
    this.ast = ast;
    this.bigArr = [];
    this.encryptFunc = encryptFunc;
};

// 改变对象属性访问方式 console.log 改为console["log"]访问形式
ConfoundUtils.prototype.changeAccessMode = function () {
    traverse(this.ast, {
        MemberExpression(path) {
            if (t.isIdentifier(path.node.property)) {
                let name = path.node.property.name;
                path.node.property = t.stringLiteral(name);
            }
            path.node.computed = true;
        }
    });
};

// 标准内置对象的处理
ConfoundUtils.prototype.changeBuiltinObjects = function () {
    traverse(this.ast, {
        Identifier(path) {
            let name = path.node.name;
            if ('|eval|parseInt|encodeURIComponent|Object|Function|Boolean|Number|Math|Date|String|RegExp|Array|'.indexOf(`|${name}|`) != -1) {
                path.replaceWith(t.memberExpression(t.identifier("window"), t.stringLiteral(name), true));
            }
        }
    });
};

// 数值常量加密
ConfoundUtils.prototype.numericEncrypt = function () {
    traverse(this.ast, {
        NumericLiteral(path) {
            let value = path.node.value;
            let key = parseInt(Math.random() * (999999 - 100000) + 100000, 10);
            let ciperNum = value ^ key;
            path.replaceWith(t.binaryExpression('^', t.numericLiteral(ciperNum), t.numericLiteral(key)));
            path.skip();
        }
    });
};

// 字符串加密与混淆
ConfoundUtils.prototype.arrayConfound = function () {
    let bigArr = [];
    let encryptFunc = this.encryptFunc;
    traverse(this.ast, {
        StringLiteral(path) {
            let bigArrIndex = bigArr.indexOf(encryptFunc(path.node.value));
            let index = bigArrIndex;
            if (bigArrIndex == -1) {
                let length = bigArr.push(encryptFunc(path.node.value));
                index = length - 1;
            }
            let encStr = t.callExpression(t.identifier("atob"), [
                t.memberExpression(t.identifier('arr'), t.numericLiteral(index), true)
            ]);
            path.replaceWith(encStr);
        }
    });
    bigArr = bigArr.map(function (v) {
        return t.stringLiteral(v);
    });
    this.bigArr = bigArr;
}

// 字符串转十六进制格式
ConfoundUtils.prototype.stringToHex = function () {
    function hexEnc(code) {
        for (var hexStr = [], i = 0, s; i < code.length; i++) {
            s = code.charCodeAt(i).toString(16);
            hexStr += "\\x" + s;
        }
        return hexStr;
    }
    traverse(this.ast, {
        MemberExpression(path) {
            if (t.isIdentifier(path.node.property)) {
                let name = path.node.property.name;
                path.node.property = t.stringLiteral(hexEnc(name));
            }
            path.node.computed = true;
        }
    });

};

// 数组乱序
ConfoundUtils.prototype.arrayShuffle = function () {
    (function (myArr, num) {
        let xiaojianbang = function (nums) {
            while (--nums) {
                myArr.unshift(myArr.pop());
            }
        };
        xiaojianbang(++num);

    })(this.bigArr, 0x10);
};

ConfoundUtils.prototype.unshiftArrayDeclaration = function () {
    // 生成bigArr定义

    // 声明数组
    this.bigArr = t.variableDeclarator(t.identifier("arr"), t.arrayExpression(this.bigArr));
    // 定义变量
    this.bigArr = t.variableDeclaration("var", [this.bigArr]);

    // 将代码放到源码开头
    this.ast.program.body.unshift(this.bigArr);
};

// 拼接两个ast的body部分
ConfoundUtils.prototype.astConcatUnshift = function (ast) {
    this.ast.program.body.unshift(ast);
};

ConfoundUtils.prototype.getAst = function () {
    return this.ast;
};

module.exports = {
    ConfoundUtils,
    base64Encode
};