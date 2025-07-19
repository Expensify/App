import ts from 'typescript';

/**
 * Walk up the AST from a given node and return the nearest ancestor that matches a predicate.
 *
 * @param node The starting node.
 * @param predicate A function that returns true for the desired ancestor type.
 * @returns The nearest matching ancestor node, or undefined if none found.
 */
function findAncestor<T extends ts.Node>(node: ts.Node, predicate: (n: ts.Node) => n is T): T | undefined {
    let current: ts.Node | undefined = node.parent;
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
function addImport(sourceFile: ts.SourceFile, identifierName: string, modulePath: string, isTypeOnly = false): ts.SourceFile {
    const newImport = ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(isTypeOnly, ts.factory.createIdentifier(identifierName), undefined),
        ts.factory.createStringLiteral(modulePath),
    );

    // Find the index of the last import declaration
    let lastImportIndex = -1;
    for (let i = sourceFile.statements.length - 1; i >= 0; i--) {
        if (ts.isImportDeclaration(sourceFile.statements[i])) {
            lastImportIndex = i;
            break;
        }
    }

    const updatedStatements = ts.factory.createNodeArray([...sourceFile.statements.slice(0, lastImportIndex + 1), newImport, ...sourceFile.statements.slice(lastImportIndex + 1)]);

    return ts.factory.updateSourceFile(sourceFile, updatedStatements);
}

/**
 * This type is just a simple wrapper around a ts node with a label.
 */
type LabeledNode<K extends string> = {
    label: K;
    node: ts.Node;
};

/**
 * Custom type for expressions that have both 'expression' and 'type' properties.
 * This is useful for satisfies expressions and type assertions.
 */
type ExpressionWithType = ts.Node & {
    expression: ts.Expression;
    type: ts.TypeNode;
};

/**
 * Walks a list of AST nodes in parallel and applies the visitor function at each set of corresponding nodes.
 * Traverses only to the depth and breadth of the shortest subtree at each level.
 *
 * disclaimer: I don't know how this should/will work for ASTs that don't share a common structure. For now, that's undefined behavior.
 */
function traverseASTsInParallel<K extends string>(roots: Array<LabeledNode<K>>, visit: (nodes: Record<K, ts.Node>) => void): void {
    if (roots.length === 0) {
        return;
    }

    const nodeMap: Partial<Record<K, ts.Node>> = {};
    for (const {label, node} of roots) {
        nodeMap[label] = node;
    }
    visit(nodeMap as Record<K, ts.Node>);

    // Collect children per label
    const childrenByLabel = new Map<K, ts.Node[]>();
    let minChildren = Infinity;

    for (const {label, node} of roots) {
        const children = node.getChildren();
        childrenByLabel.set(label, children);
        if (children.length < minChildren) {
            minChildren = children.length;
        }
    }

    // Traverse child nodes in parallel, stopping at the shortest list
    for (let i = 0; i < minChildren; i++) {
        const nextLevel: Array<LabeledNode<K>> = [];
        for (const {label} of roots) {
            const children = childrenByLabel.get(label) ?? [];
            const child = children.at(i);
            if (child) {
                nextLevel.push({label, node: child});
            }
        }
        traverseASTsInParallel(nextLevel, visit);
    }
}

/**
 * Finds the node that is exported as the default export.
 * Returns null if not found.
 */
function findDefaultExport(sourceFile: ts.SourceFile): ts.Node | null {
    for (const statement of sourceFile.statements) {
        if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
            return statement.expression;
        }

        if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
            for (const element of statement.exportClause.elements) {
                if (element.name.text === 'default') {
                    return element.name;
                }
            }
        }
    }

    return null;
}

/**
 * Resolves the identifier name to its declaration node within the source file.
 */
function resolveDeclaration(name: string, sourceFile: ts.SourceFile): ts.Node | null {
    for (const statement of sourceFile.statements) {
        if (ts.isVariableStatement(statement)) {
            for (const decl of statement.declarationList.declarations) {
                if (ts.isIdentifier(decl.name) && decl.name.text === name) {
                    return decl;
                }
            }
        }

        if (ts.isFunctionDeclaration(statement) && statement.name?.text === name) {
            return statement;
        }

        if (ts.isClassDeclaration(statement) && statement.name?.text === name) {
            return statement;
        }
    }

    return null;
}

/**
 * Check if a node is an expression that has both 'expression' and 'type' properties.
 * This is useful for satisfies expressions and type assertions.
 */
function isExpressionWithType(node: ts.Node): node is ExpressionWithType {
    return 'expression' in node && 'type' in node && node.expression !== undefined && node.type !== undefined;
}

/**
 * Check if a node is a satisfies expression by examining its structure.
 * This is more robust than checking SyntaxKind numbers which might vary between TS versions.
 */
function isSatisfiesExpression(node: ts.Node): node is ExpressionWithType {
    // Check if the node text contains 'satisfies' and has the expected structure
    const nodeText = node.getText();
    if (!nodeText.includes(' satisfies ')) {
        return false;
    }

    return isExpressionWithType(node);
}

/**
 * Extracts the identifier name from various expression types.
 * Handles cases like:
 * - Simple identifier: `translations`
 * - Satisfies expression: `translations satisfies SomeType`
 * - As expression: `translations as SomeType`
 * - Parenthesized expression: `(translations)`
 * - Type assertion: `<SomeType>translations`
 */
function extractIdentifierFromExpression(node: ts.Node): string | null {
    // Direct identifier
    if (ts.isIdentifier(node)) {
        return node.text;
    }

    // Check for satisfies expression by looking at the node structure
    // A satisfies expression has the form: expression satisfies type
    if (isSatisfiesExpression(node)) {
        return extractIdentifierFromExpression(node.expression);
    }

    // As expression: `translations as SomeType`
    if (ts.isAsExpression(node)) {
        return extractIdentifierFromExpression(node.expression);
    }

    // Parenthesized expression: `(translations)`
    if (ts.isParenthesizedExpression(node)) {
        return extractIdentifierFromExpression(node.expression);
    }

    // Type assertion: `<SomeType>translations`
    // Check for type assertion by looking for angle bracket syntax and structure
    const nodeText = node.getText();
    if (nodeText.includes('<') && nodeText.includes('>') && 'expression' in node && 'type' in node && node.expression !== undefined && node.type !== undefined) {
        return extractIdentifierFromExpression(node.expression as ts.Node);
    }

    return null;
}

/**
 * Extracts the key name from a TypeScript property assignment or method declaration node.
 * Handles cases like:
 * - Property assignment: `key: value` -> "key"
 * - String literal property: `"key": value` -> "key"
 * - Method declaration: `key() { ... }` -> "key"
 *
 * @param node The PropertyAssignment or MethodDeclaration node to extract the key from
 * @returns The key name as a string, or undefined if the key cannot be extracted
 */
function extractKeyFromPropertyNode(node: ts.PropertyAssignment | ts.MethodDeclaration): string | undefined {
    if (ts.isPropertyAssignment(node)) {
        if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) {
            return node.name.text;
        }
    } else if (ts.isMethodDeclaration(node) && ts.isIdentifier(node.name)) {
        return node.name.text;
    }
    return undefined;
}

export default {findAncestor, addImport, traverseASTsInParallel, findDefaultExport, resolveDeclaration, extractIdentifierFromExpression, extractKeyFromPropertyNode};
export type {LabeledNode, ExpressionWithType};
