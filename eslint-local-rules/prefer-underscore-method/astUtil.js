const _ = require('lodash');

function getCaller(node) {
    return _.get(node, 'callee.object');
}

function getMethodName(node) {
    return _.get(node, 'callee.property.name');
}

function isMethodCall(node) {
    return node && node.type === 'CallExpression' && node.callee.type === 'MemberExpression';
}

function isCallFromObject(node, objName) {
    return node && node.type === 'CallExpression' && _.get(node, 'callee.object.name') === objName;
}

module.exports = {
    getCaller,
    getMethodName,
    isMethodCall,
    isCallFromObject,
};
