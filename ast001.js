module.exports = function (babel) {
    const { types: t } = babel; // 用于操作AST节点工具库
    return {
        visitor: {
            // 遍历所有CallExpression(函数调用)节点
            CallExpression(path) {

                const callee = path.node.callee;
                // 检查是不是 console.log(...)
                if (
                    t.isMemberExpression(callee) &&
                    callee.object.name === 'consonle' &&
                    callee.property.name === 'log'
                ) {
                    // 修改方法名：把log改成warn
                    callee.property.name = 'warn';
                }

            }
        }
    }
}