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
    // Check if the import already exists
    for (const statement of sourceFile.statements) {
        if (ts.isImportDeclaration(statement) && statement.importClause) {
            const importClause = statement.importClause;
            // Check for default import with matching name and module path
            const existingIsTypeOnly = importClause.phaseModifier === ts.SyntaxKind.TypeKeyword;
            if (
                importClause.name?.text === identifierName &&
                statement.moduleSpecifier &&
                ts.isStringLiteral(statement.moduleSpecifier) &&
                statement.moduleSpecifier.text === modulePath &&
                existingIsTypeOnly === isTypeOnly
            ) {
                return sourceFile; // Import already exists, return unchanged
            }
        }
    }

    const phaseModifier = isTypeOnly ? ts.SyntaxKind.TypeKeyword : undefined;
    const newImport = ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(phaseModifier, ts.factory.createIdentifier(identifierName), undefined),
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
 * Custom type for expressions that have both 'expression' and 'type' properties.
 * This is useful for satisfies expressions and type assertions.
 */
type ExpressionWithType = ts.Node & {
    expression: ts.Expression;
    type: ts.TypeNode;
};

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

/**
 * Build a dot-notation path from a node by traversing up the AST to find property assignments.
 * Useful for building paths like "common.save" from a string literal node.
 */
// eslint-disable-next-line rulesdir/no-negated-variables
function buildDotNotationPath(node: ts.Node, rootNode?: ts.Node): string | null {
    const pathParts: string[] = [];
    let current: ts.Node | undefined = node;

    // Traverse up the tree until we reach the root node or source file
    while (current && current !== rootNode && !ts.isSourceFile(current)) {
        if (ts.isPropertyAssignment(current)) {
            const key = extractKeyFromPropertyNode(current);
            if (key) {
                pathParts.unshift(key);
            }
        }
        current = current.parent;
    }

    return pathParts.length > 0 ? pathParts.join('.') : null;
}

/**
 * Parse a code string back to a TypeScript expression.
 * Useful for converting serialized expressions back to AST nodes.
 * @disclaimer This is intended to work only for single expressions of code, not entire files or multiple statements.
 */
function parseCodeStringToAST(codeString: string): ts.Expression {
    try {
        const tempSourceFile = ts.createSourceFile('temp.ts', `const temp = ${codeString};`, ts.ScriptTarget.Latest);

        // Check for parsing errors
        // @ts-expect-error parseDiagnostics is not a public property of the SourceFile type, but this works.
        // The "correct" way to do this is with `ts.createProgram`, but it's more complicated and it makes the translation script at least ~4x slower.
        if (tempSourceFile.parseDiagnostics && (tempSourceFile.parseDiagnostics as unknown as ts.Diagnostic[]).length > 0) {
            throw new Error(`Malformed code string: ${codeString}`);
        }

        const tempStatement = tempSourceFile.statements.at(0);
        if (!tempStatement || !ts.isVariableStatement(tempStatement)) {
            throw new Error(`Malformed code string: ${codeString}`);
        }

        const declaration = tempStatement.declarationList.declarations.at(0);
        if (!declaration?.initializer) {
            throw new Error(`No initializer found in code string: ${codeString}`);
        }

        return declaration.initializer;
    } catch (error) {
        if (error instanceof Error && error.message.includes('code string')) {
            throw error; // Re-throw our custom errors
        }
        throw new Error(`Malformed code string: ${codeString}`);
    }
}

/**
 * Create a visitor function for ts.visitEachChild that builds dot-notation paths.
 */
function createPathAwareVisitor<T>(visitWithPath: (node: ts.Node, path: string) => T, currentPath: string): (child: ts.Node) => T {
    return (child: ts.Node) => {
        let childPath = currentPath;

        // If the child is a property assignment, update the path
        if (ts.isPropertyAssignment(child)) {
            const propName = extractKeyFromPropertyNode(child);
            if (propName) {
                childPath = currentPath ? `${currentPath}.${propName}` : propName;
            }
        }

        return visitWithPath(child, childPath);
    };
}

export default {
    findAncestor,
    addImport,
    findDefaultExport,
    resolveDeclaration,
    extractIdentifierFromExpression,
    extractKeyFromPropertyNode,
    buildDotNotationPath,
    parseCodeStringToAST,
    createPathAwareVisitor,
};
export type {ExpressionWithType};
