const _ = require('lodash');

const ALIASES = {
    each: ['forEach'],
    map: ['collect'],
    reduceRight: ['foldr'],
    reduce: ['foldl', 'inject'],
    filter: ['select'],
    every: ['all'],
    some: ['any'],
    find: ['detect'],
    contains: ['includes'],
    first: ['head', 'take'],
    rest: ['tail', 'drop'],
    uniq: ['unique'],
    functions: ['methods'],
    extendOwn: ['assign'],
    matcher: ['matches'],
};

const WRAPPER_ALIASES = {
    value: ['toString', 'toJSON', 'valueOf'],
};

const CHAINABLE = [
    'after', 'ary', 'assign', 'at', 'before', 'bind', 'bindAll', 'bindKey', 'callback', 'chain', 'chunk', 'commit', 'compact', 'concat', 'constant', 'countBy', 'create', 'curry',
    'debounce', 'defaults', 'defaultsDeep', 'defer', 'delay', 'difference', 'drop', 'dropRight', 'dropRightWhile', 'dropWhile', 'fill', 'filter', 'flatten', 'flattenDeep', 'flow',
    'flowRight', 'forEach', 'forEachRight', 'forIn', 'forInRight', 'forOwn', 'forOwnRight', 'functions', 'groupBy', 'indexBy', 'initial', 'intersection', 'invert', 'invoke', 'keys',
    'keysIn', 'map', 'mapKeys', 'mapValues', 'matches', 'matchesProperty', 'memoize', 'merge', 'method', 'methodOf', 'mixin', 'modArgs', 'negate', 'omit', 'once', 'pairs', 'partial',
    'partialRight', 'partition', 'pick', 'plant', 'pluck', 'property', 'propertyOf', 'pull', 'pullAt', 'push', 'range', 'rearg', 'reject', 'remove', 'rest', 'restParam', 'reverse', 'set',
    'shuffle', 'slice', 'sort', 'sortBy', 'sortByAll', 'sortByOrder', 'splice', 'spread', 'take', 'takeRight', 'takeRightWhile', 'takeWhile', 'tap', 'throttle', 'thru', 'times', 'toArray',
    'toPlainObject', 'transform', 'union', 'uniq', 'unshift', 'unzip', 'unzipWith', 'values', 'valuesIn', 'where', 'without', 'wrap', 'xor', 'zip', 'zipObject', 'zipWith'];

const ALL_ALIASES = _.assign({}, ALIASES, WRAPPER_ALIASES);
function expandAlias(method) {
    return method in ALL_ALIASES ? ALL_ALIASES[method].concat(method) : [method];
}

function expandAliases(methods) {
    return _(methods).map(expandAlias).flatten().value();
}

const WRAPPER_METHODS = ['concat', 'join', 'pop', 'push', 'reverse', 'shift', 'slice', 'sort', 'splice', 'unshift', 'replace', 'split'];

module.exports = {
    CHAINABLE_ALIASES: expandAliases(CHAINABLE),
    WRAPPER_METHODS,
};
