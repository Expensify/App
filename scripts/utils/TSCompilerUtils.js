"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var typescript_1 = require("typescript");
/**
 * Walk up the AST from a given node and return the nearest ancestor that matches a predicate.
 *
 * @param node The starting node.
 * @param predicate A function that returns true for the desired ancestor type.
 * @returns The nearest matching ancestor node, or undefined if none found.
 */
function findAncestor(node, predicate) {
    var current = node.parent;
    while (current) {
        if (predicate(current)) {
            return current;
        }
        current = current.parent;
    }
    return undefined;
}
/**
 * Adds a default import statement to the provided SourceFile.
 */
function addImport(sourceFile, identifierName, modulePath, isTypeOnly) {
    if (isTypeOnly === void 0) { isTypeOnly = false; }
    var newImport = typescript_1.default.factory.createImportDeclaration(undefined, typescript_1.default.factory.createImportClause(isTypeOnly, typescript_1.default.factory.createIdentifier(identifierName), undefined), typescript_1.default.factory.createStringLiteral(modulePath));
    // Find the index of the last import declaration
    var lastImportIndex = sourceFile.statements.findLastIndex(function (statement) { return typescript_1.default.isImportDeclaration(statement); });
    var updatedStatements = typescript_1.default.factory.createNodeArray(__spreadArray(__spreadArray(__spreadArray([], sourceFile.statements.slice(0, lastImportIndex + 1), true), [newImport], false), sourceFile.statements.slice(lastImportIndex + 1), true));
    return typescript_1.default.factory.updateSourceFile(sourceFile, updatedStatements);
}
exports.default = { findAncestor: findAncestor, addImport: addImport };
