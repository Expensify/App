"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Expensicons = jest.requireActual('../Expensicons');
module.exports = Object.keys(Expensicons).reduce(function (acc, curr) {
    // We set the name of the anonymous mock function here so we can dynamically build the list of mocks and access the
    // "name" property to use in accessibility hints for element querying
    var fn = function () { return ''; };
    Object.defineProperty(fn, 'name', { value: curr });
    acc[curr] = fn;
    return acc;
}, {});
