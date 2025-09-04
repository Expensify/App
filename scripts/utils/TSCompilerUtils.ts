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
 * Check if a TypeScript AST node represents the root of an object literal.
 * This is used to determine if object manipulation utilities can be applied.
 *
 * @param node The AST node to check
 * @returns true if the node is an object literal expression, false otherwise
 */
function isObject(node: ts.Node): node is ts.ObjectLiteralExpression {
    return ts.isObjectLiteralExpression(node);
}

/**
 * Merge two TypeScript object literal AST nodes, similar to _.merge from lodash.
 * Properties from the source object will be merged into the target object.
 * For nested objects, properties are merged recursively.
 * For non-object properties, source values overwrite target values.
 *
 * @param target The target object literal to merge into
 * @param source The source object literal to merge from
 * @returns A new object literal expression with merged properties
 * @throws Error if either node is not an object literal expression
 */
function objectMerge(target: ts.Node, source: ts.Node): ts.ObjectLiteralExpression {
    if (!isObject(target)) {
        throw new Error('Target node must be an object literal expression');
    }
    if (!isObject(source)) {
        throw new Error('Source node must be an object literal expression');
    }

    // Create a map of target properties by key for easy lookup, cloning them to avoid source file context issues
    const targetPropsMap = new Map<string, ts.ObjectLiteralElementLike>();
    for (const prop of target.properties) {
        if (ts.isPropertyAssignment(prop)) {
            const key = extractKeyFromPropertyNode(prop);
            if (key) {
                const clonedProp = clonePropertyAssignment(prop);
                targetPropsMap.set(key, clonedProp);
            }
        } else if (ts.isMethodDeclaration(prop)) {
            const key = extractKeyFromPropertyNode(prop);
            if (key) {
                const clonedMethod = cloneMethodDeclaration(prop);
                targetPropsMap.set(key, clonedMethod);
            }
        } else {
            // For spread assignments, shorthand properties, etc., keep them as-is
            targetPropsMap.set(prop.getText(), prop);
        }
    }

    // Process source properties and merge them
    for (const sourceProp of source.properties) {
        if (ts.isPropertyAssignment(sourceProp) || ts.isMethodDeclaration(sourceProp)) {
            const key = extractKeyFromPropertyNode(sourceProp);
            if (key) {
                const targetProp = targetPropsMap.get(key);

                if (targetProp && ts.isPropertyAssignment(targetProp) && ts.isPropertyAssignment(sourceProp)) {
                    // Both are property assignments - check if we need recursive merge
                    if (isObject(targetProp.initializer) && isObject(sourceProp.initializer)) {
                        // Recursively merge nested objects
                        const mergedValue = objectMerge(targetProp.initializer, sourceProp.initializer);
                        const mergedProp = ts.factory.createPropertyAssignment(sourceProp.name, mergedValue);
                        targetPropsMap.set(key, mergedProp);
                    } else {
                        // Source overwrites target - need to properly clone the source property
                        const clonedProp = clonePropertyAssignment(sourceProp);
                        targetPropsMap.set(key, clonedProp);
                    }
                } else if (ts.isPropertyAssignment(sourceProp)) {
                    // No target property - clone the source property
                    const clonedProp = clonePropertyAssignment(sourceProp);
                    targetPropsMap.set(key, clonedProp);
                } else if (ts.isMethodDeclaration(sourceProp)) {
                    // Clone method declarations
                    const clonedMethod = cloneMethodDeclaration(sourceProp);
                    targetPropsMap.set(key, clonedMethod);
                } else {
                    // For other property types, use as-is
                    targetPropsMap.set(key, sourceProp);
                }
            }
        } else {
            // For other property types (spread, shorthand, etc.), just add them
            targetPropsMap.set(sourceProp.getText(), sourceProp);
        }
    }

    // Create new object literal with merged properties
    const mergedProperties = Array.from(targetPropsMap.values());
    return ts.factory.createObjectLiteralExpression(mergedProperties);
}

/**
 * Remove specified properties from a TypeScript object literal AST node, similar to _.omit from lodash.
 * Creates a new object with all properties except the ones specified in the omit list.
 *
 * @param obj The object literal to omit properties from
 * @param keysToOmit Array of property keys to remove from the object
 * @returns A new object literal expression with specified properties omitted
 * @throws Error if the node is not an object literal expression
 */
function objectOmit(obj: ts.Node, keysToOmit: string[]): ts.ObjectLiteralExpression {
    if (!isObject(obj)) {
        throw new Error('Node must be an object literal expression');
    }

    const omitSet = new Set(keysToOmit);
    const keptProperties: ts.ObjectLiteralElementLike[] = [];

    for (const prop of obj.properties) {
        if (ts.isPropertyAssignment(prop) || ts.isMethodDeclaration(prop)) {
            const key = extractKeyFromPropertyNode(prop);
            if (key && !omitSet.has(key)) {
                // Keep this property - clone it to avoid source file context issues
                if (ts.isPropertyAssignment(prop)) {
                    const clonedProp = clonePropertyAssignment(prop);
                    keptProperties.push(clonedProp);
                } else if (ts.isMethodDeclaration(prop)) {
                    const clonedMethod = cloneMethodDeclaration(prop);
                    keptProperties.push(clonedMethod);
                }
            }
            // If key is in omitSet, skip this property (effectively omitting it)
        } else {
            // For spread assignments, shorthand properties, etc., keep them as-is
            keptProperties.push(prop);
        }
    }

    return ts.factory.createObjectLiteralExpression(keptProperties);
}

/**
 * Clone a property assignment by recreating it with the TypeScript factory.
 * This ensures the cloned property doesn't maintain references to the original source file.
 */
function clonePropertyAssignment(prop: ts.PropertyAssignment): ts.PropertyAssignment {
    return ts.factory.createPropertyAssignment(clonePropertyName(prop.name), cloneExpression(prop.initializer));
}

/**
 * Clone a method declaration by recreating it with the TypeScript factory.
 */
function cloneMethodDeclaration(method: ts.MethodDeclaration): ts.MethodDeclaration {
    return ts.factory.createMethodDeclaration(
        method.modifiers,
        method.asteriskToken,
        clonePropertyName(method.name),
        method.questionToken,
        method.typeParameters,
        method.parameters,
        method.type,
        method.body,
    );
}

/**
 * Clone a property name (identifier or string literal).
 */
function clonePropertyName(name: ts.PropertyName): ts.PropertyName {
    if (ts.isIdentifier(name)) {
        return ts.factory.createIdentifier(name.text);
    }
    if (ts.isStringLiteral(name)) {
        return ts.factory.createStringLiteral(name.text);
    }
    if (ts.isNumericLiteral(name)) {
        return ts.factory.createNumericLiteral(name.text);
    }
    // For computed property names and other complex cases, use as-is
    return name;
}

/**
 * Clone a block statement by recursively cloning all its statements.
 */
function cloneBlock(block: ts.Block): ts.Block {
    const clonedStatements = block.statements.map((stmt) => cloneStatement(stmt));
    return ts.factory.createBlock(clonedStatements);
}

/**
 * Clone a statement by recreating it with the TypeScript factory.
 */
function cloneStatement(stmt: ts.Statement): ts.Statement {
    // For now, use the transformer approach for statements since they're very complex
    // This is a simplified implementation - in practice, we'd need to handle many statement types
    const transformer: ts.TransformerFactory<ts.Node> = (context) => {
        const visit: ts.Visitor = (node) => {
            // For specific node types we know how to clone, do it explicitly
            if (ts.isStringLiteral(node)) {
                return ts.factory.createStringLiteral(node.text);
            }
            if (ts.isNumericLiteral(node)) {
                return ts.factory.createNumericLiteral(node.text);
            }
            if (ts.isIdentifier(node)) {
                return ts.factory.createIdentifier(node.text);
            }
            // For other nodes, recursively visit children
            return ts.visitEachChild(node, visit, context);
        };
        return (rootNode) => ts.visitNode(rootNode, visit) ?? rootNode;
    };
    const result = ts.transform(stmt, [transformer]);
    const cloned = result.transformed.at(0) as ts.Statement;
    result.dispose();
    return cloned;
}

/**
 * Clone an expression by recreating it with the TypeScript factory.
 */
function cloneExpression(expr: ts.Expression): ts.Expression {
    if (ts.isStringLiteral(expr)) {
        return ts.factory.createStringLiteral(expr.text);
    }
    if (ts.isNumericLiteral(expr)) {
        return ts.factory.createNumericLiteral(expr.text);
    }
    if (expr.kind === ts.SyntaxKind.TrueKeyword) {
        return ts.factory.createTrue();
    }
    if (expr.kind === ts.SyntaxKind.FalseKeyword) {
        return ts.factory.createFalse();
    }
    if (expr.kind === ts.SyntaxKind.NullKeyword) {
        return ts.factory.createNull();
    }
    if (ts.isTemplateExpression(expr)) {
        // Clone template expressions properly
        const clonedHead = ts.factory.createTemplateHead(expr.head.text);
        const clonedSpans = expr.templateSpans.map((span) => {
            const clonedExpr = cloneExpression(span.expression);
            const clonedLiteral = span.literal.kind === ts.SyntaxKind.TemplateMiddle ? ts.factory.createTemplateMiddle(span.literal.text) : ts.factory.createTemplateTail(span.literal.text);
            return ts.factory.createTemplateSpan(clonedExpr, clonedLiteral);
        });
        return ts.factory.createTemplateExpression(clonedHead, clonedSpans);
    }
    if (ts.isNoSubstitutionTemplateLiteral(expr)) {
        return ts.factory.createNoSubstitutionTemplateLiteral(expr.text);
    }
    if (ts.isConditionalExpression(expr)) {
        // Clone ternary expressions properly
        const clonedCondition = cloneExpression(expr.condition);
        const clonedWhenTrue = cloneExpression(expr.whenTrue);
        const clonedWhenFalse = cloneExpression(expr.whenFalse);
        return ts.factory.createConditionalExpression(clonedCondition, expr.questionToken, clonedWhenTrue, expr.colonToken, clonedWhenFalse);
    }
    if (ts.isArrowFunction(expr)) {
        // Clone arrow functions properly, including the body
        const clonedBody = ts.isBlock(expr.body) ? cloneBlock(expr.body) : cloneExpression(expr.body);
        return ts.factory.createArrowFunction(expr.modifiers, expr.typeParameters, expr.parameters, expr.type, expr.equalsGreaterThanToken, clonedBody);
    }
    if (ts.isPropertyAccessExpression(expr)) {
        // Clone property access expressions (e.g., user.name)
        const clonedExpression = cloneExpression(expr.expression);
        return ts.factory.createPropertyAccessExpression(clonedExpression, expr.name);
    }
    if (ts.isIdentifier(expr)) {
        // Clone identifiers
        return ts.factory.createIdentifier(expr.text);
    }
    if (ts.isBinaryExpression(expr)) {
        // Clone binary expressions (e.g., a > b, a ?? b)
        const clonedLeft = cloneExpression(expr.left);
        const clonedRight = cloneExpression(expr.right);
        return ts.factory.createBinaryExpression(clonedLeft, expr.operatorToken, clonedRight);
    }
    if (isObject(expr)) {
        // For nested objects, clone all their properties
        const clonedProperties = expr.properties.map((prop) => {
            if (ts.isPropertyAssignment(prop)) {
                return clonePropertyAssignment(prop);
            }
            if (ts.isMethodDeclaration(prop)) {
                return cloneMethodDeclaration(prop);
            }
            // For other property types, use as-is
            return prop;
        });
        return ts.factory.createObjectLiteralExpression(clonedProperties);
    }

    // For other complex expressions, use a more robust transformer
    const transformer: ts.TransformerFactory<ts.Node> = (context) => {
        const visit: ts.Visitor = (node) => {
            // Recursively clone all child nodes
            return ts.visitEachChild(node, visit, context);
        };
        return (rootNode) => ts.visitNode(rootNode, visit) ?? rootNode;
    };
    const result = ts.transform(expr, [transformer]);
    const cloned = result.transformed.at(0) as ts.Expression;
    result.dispose();
    return cloned;
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

export default {
    findAncestor,
    addImport,
    findDefaultExport,
    resolveDeclaration,
    extractIdentifierFromExpression,
    extractKeyFromPropertyNode,
    isObject,
    objectMerge,
    objectOmit,
};
export type {ExpressionWithType};
