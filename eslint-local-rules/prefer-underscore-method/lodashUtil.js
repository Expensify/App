const _ = require('lodash');
const aliasMap = require('./aliases');
const astUtil = require('./astUtil');

function isLodashCall(node) {
    return astUtil.isCallFromObject(node, '_');
}

function isChainable(node) {
    return _.includes(aliasMap.CHAINABLE_ALIASES, astUtil.getMethodName(node));
}

function isLodashChainStart(node) {
    return node && node.type === 'CallExpression' && (node.callee.name === '_' || (_.get(node, 'callee.object.name') === '_' && astUtil.getMethodName(node) === 'chain'));
}

function isLodashWrapper(node) {
    if (isLodashChainStart(node)) {
        return true;
    }
    // eslint-disable-next-line no-unused-vars
    return astUtil.isMethodCall(node) && isChainable(node) && isLodashWrapper(node.callee.object);
}

function isLodashWrapperMethod(node) {
    return _.includes(aliasMap.WRAPPER_METHODS, astUtil.getMethodName(node)) && node.type === 'CallExpression';
}

function isNativeCollectionMethodCall(node) {
    return _.includes(['every', 'filter', 'find', 'findIndex', 'each', 'map', 'reduce', 'reduceRight', 'some'], astUtil.getMethodName(node));
}

module.exports = {
    isLodashCall,
    isNativeCollectionMethodCall,
    isLodashWrapperMethod,
    isLodashWrapper,
};
