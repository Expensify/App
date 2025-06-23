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
    const lastImportIndex = sourceFile.statements.findLastIndex((statement) => ts.isImportDeclaration(statement));

    const updatedStatements = ts.factory.createNodeArray([...sourceFile.statements.slice(0, lastImportIndex + 1), newImport, ...sourceFile.statements.slice(lastImportIndex + 1)]);

    return ts.factory.updateSourceFile(sourceFile, updatedStatements);
}

/**
 * Walks a list of AST nodes in parallel and applies the visitor function at each set of corresponding nodes.
 * Traverses only to the depth and breadth of the shortest subtree at each level.
 *
 * disclaimer: I don't know how this should/will work for ASTs that don't share a common structure. For now, that's undefined behavior.
 */
function traverseASTsInParallel(nodes: ts.Node[], visitor: (nodes: ts.Node[]) => void): void {
    if (nodes.length === 0) {
        return;
    }

    visitor(nodes);

    // Recursively walk all corresponding children
    const childrenLists = nodes.map((node) => node.getChildren());
    const minLength = Math.min(...childrenLists.map((list) => list.length));

    for (let i = 0; i < minLength; i++) {
        const children = childrenLists.map((list) => list[i]);
        traverseASTsInParallel(children, visitor);
    }
}

export default {findAncestor, addImport, traverseASTsInParallel};
