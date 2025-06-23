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

type ASTWalker = {
    node: ts.Node;
    visit: (node: ts.Node) => void;
};

/**
 * Walks a list of AST nodes in parallel and applies the visitor function at each set of corresponding nodes.
 * Traverses only to the depth and breadth of the shortest subtree at each level.
 *
 * disclaimer: I don't know how this should/will work for ASTs that don't share a common structure. For now, that's undefined behavior.
 */
function traverseASTsInParallel(walkers: ASTWalker[] = []): void {
    if (walkers.length === 0) {
        return;
    }

    for (const {node, visit} of walkers) {
        visit(node);
    }

    const childWalkerLists: ASTWalker[][] = [];
    let minChildren = Infinity;

    for (const {node, visit} of walkers) {
        const children = node.getChildren();
        const childWalkers: ASTWalker[] = [];
        for (const child of children) {
            childWalkers.push({node: child, visit});
        }
        childWalkerLists.push(childWalkers);
        if (children.length < minChildren) {
            minChildren = children.length;
        }
    }

    // Traverse child nodes in parallel, stopping at the shortest list
    for (let i = 0; i < minChildren; i++) {
        const nextLevelWalkers: ASTWalker[] = [];

        for (const childWalkerList of childWalkerLists) {
            const nextLevelWalker = childWalkerList.at(i);
            if (nextLevelWalker) {
                nextLevelWalkers.push(nextLevelWalker);
            }
        }

        traverseASTsInParallel(nextLevelWalkers);
    }
}

export default {findAncestor, addImport, traverseASTsInParallel};
