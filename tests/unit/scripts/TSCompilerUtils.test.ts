import ts from 'typescript';
import TSCompilerUtils from '../../../scripts/utils/TSCompilerUtils';

const PLURAL_KEY_SOURCE = `
const translations = {
    policyCopyChangeLog: {
        codingRules: ({sourcePolicyName}: {sourcePolicyName: string}) => ({
            one: \`copied 1 merchant rule from \${sourcePolicyName}\`,
            other: (count: number) => \`copied \${count} merchant rules from \${sourcePolicyName}\`,
        }),
    },
};
`;

function createSourceFile(source = PLURAL_KEY_SOURCE) {
    return ts.createSourceFile('test.ts', source, ts.ScriptTarget.Latest, true);
}

function findFirstNode<T extends ts.Node>(sourceFile: ts.SourceFile, predicate: (node: ts.Node) => node is T): T | undefined;
function findFirstNode(sourceFile: ts.SourceFile, predicate: (node: ts.Node) => boolean): ts.Node | undefined;
function findFirstNode(sourceFile: ts.SourceFile, predicate: (node: ts.Node) => boolean): ts.Node | undefined {
    let found: ts.Node | undefined;
    const visit = (node: ts.Node) => {
        if (found) {
            return;
        }
        if (predicate(node)) {
            found = node;
            return;
        }
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return found;
}

function assertDefined<T>(value: T | undefined | null, message: string): asserts value is T {
    if (value !== undefined && value !== null) {
        return;
    }

    throw new Error(message);
}

function getTemplateStaticText(node: ts.TemplateExpression) {
    let staticText = node.head.text;
    for (const span of node.templateSpans) {
        staticText += span.literal.text;
    }
    return staticText;
}

function findTemplateInPluralOther(sourceFile: ts.SourceFile) {
    return findFirstNode(sourceFile, (node) => {
        if (!ts.isTemplateExpression(node) || !getTemplateStaticText(node).includes('merchant rules')) {
            return false;
        }

        const otherProperty = TSCompilerUtils.findAncestor(node, (ancestor): ancestor is ts.PropertyAssignment => {
            return ts.isPropertyAssignment(ancestor) && ts.isIdentifier(ancestor.name) && ancestor.name.text === 'other';
        });

        return !!otherProperty;
    });
}

function findTemplateInPluralOne(sourceFile: ts.SourceFile) {
    return findFirstNode(sourceFile, (node) => {
        if (!ts.isTemplateExpression(node)) {
            return false;
        }

        const staticText = getTemplateStaticText(node);
        if (!staticText.includes('merchant rule from') || staticText.includes('merchant rules')) {
            return false;
        }

        const oneProperty = TSCompilerUtils.findAncestor(node, (ancestor): ancestor is ts.PropertyAssignment => {
            return ts.isPropertyAssignment(ancestor) && ts.isIdentifier(ancestor.name) && ancestor.name.text === 'one';
        });

        return !!oneProperty;
    });
}

describe('buildDotNotationPath', () => {
    it('collapses to the function-valued property when a plural form string changes inside other', () => {
        const sourceFile = createSourceFile();
        const templateNode = findTemplateInPluralOther(sourceFile);

        expect(templateNode).toBeDefined();
        assertDefined(templateNode, 'Expected template node in plural other');

        const dotPath = TSCompilerUtils.buildDotNotationPath(templateNode);

        expect(dotPath).toBe('policyCopyChangeLog.codingRules');
        expect(dotPath).not.toBe('policyCopyChangeLog.codingRules.other');
    });

    it('collapses to the function-valued property when a plural form string changes inside one', () => {
        const sourceFile = createSourceFile();
        const stringNode = findTemplateInPluralOne(sourceFile);

        expect(stringNode).toBeDefined();
        assertDefined(stringNode, 'Expected template node in plural one');

        const dotPath = TSCompilerUtils.buildDotNotationPath(stringNode);

        expect(dotPath).toBe('policyCopyChangeLog.codingRules');
        expect(dotPath).not.toBe('policyCopyChangeLog.codingRules.one');
    });

    it('still builds nested paths for ordinary object properties', () => {
        const source = `
const translations = {
    common: {
        save: 'Save',
    },
};
`;
        const sourceFile = createSourceFile(source);
        const saveNode = findFirstNode(sourceFile, (node) => ts.isStringLiteral(node) && node.text === 'Save');

        expect(saveNode).toBeDefined();
        assertDefined(saveNode, 'Expected save node');

        const dotPath = TSCompilerUtils.buildDotNotationPath(saveNode);

        expect(dotPath).toBe('common.save');
    });
});

describe('incremental plural key injection', () => {
    const tsPrinter = ts.createPrinter({removeComments: true});

    it('preserves the arrow function wrapper when injecting at the collapsed parent path', () => {
        const sourceFile = createSourceFile();
        const templateNode = findTemplateInPluralOther(sourceFile);

        expect(templateNode).toBeDefined();
        assertDefined(templateNode, 'Expected template node in plural other');

        const dotPath = TSCompilerUtils.buildDotNotationPath(templateNode);
        expect(dotPath).toBe('policyCopyChangeLog.codingRules');
        assertDefined(dotPath, 'Expected collapsed codingRules path');

        const codingRulesProperty = findFirstNode(
            sourceFile,
            (node): node is ts.PropertyAssignment => ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.name.text === 'codingRules',
        );

        expect(codingRulesProperty).toBeDefined();
        assertDefined(codingRulesProperty, 'Expected codingRules property');

        const translatedInitializer = TSCompilerUtils.parseCodeStringToAST(
            tsPrinter.printNode(ts.EmitHint.Expression, codingRulesProperty.initializer, sourceFile).replace('merchant rules', 'translated merchant rules'),
        );

        const targetObject = ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment(
                'policyCopyChangeLog',
                ts.factory.createObjectLiteralExpression([ts.factory.createPropertyAssignment('codingRules', ts.factory.createIdentifier('undefined as never'))]),
            ),
        ]);

        const injected = TSCompilerUtils.injectDeepObjectValue(targetObject, dotPath, translatedInitializer);
        const injectedText = tsPrinter.printNode(ts.EmitHint.Unspecified, injected, sourceFile);

        expect(injectedText).toMatch(/\(\s*\{\s*sourcePolicyName\s*\}/);
        expect(injectedText).toMatch(/=>\s*\(\{/);
        expect(injectedText).not.toMatch(/codingRules:\s*\{one:/);
    });

    it('flattens plural keys when leaf paths are injected separately', () => {
        const sourceFile = createSourceFile();
        const oneValue = TSCompilerUtils.parseCodeStringToAST(`\`copied 1 translated merchant rule from \${sourcePolicyName}\``);
        const otherValue = TSCompilerUtils.parseCodeStringToAST(`(count: number) => \`copied \${count} translated merchant rules from \${sourcePolicyName}\``);

        let targetObject = ts.factory.createObjectLiteralExpression([ts.factory.createPropertyAssignment('policyCopyChangeLog', ts.factory.createObjectLiteralExpression([]))]);

        targetObject = TSCompilerUtils.injectDeepObjectValue(targetObject, 'policyCopyChangeLog.codingRules.one', oneValue);
        targetObject = TSCompilerUtils.injectDeepObjectValue(targetObject, 'policyCopyChangeLog.codingRules.other', otherValue);

        const injectedText = tsPrinter.printNode(ts.EmitHint.Unspecified, targetObject, sourceFile);

        expect(injectedText).toMatch(/codingRules:\s*\{\s*one:/);
        expect(injectedText).not.toMatch(/\(\s*\{\s*sourcePolicyName\s*\}/);
    });
});

describe('removeDescendantPaths', () => {
    it('removes leaf plural paths when the parent function path is also present', () => {
        const paths = new Set(['policyCopyChangeLog.codingRules', 'policyCopyChangeLog.codingRules.one', 'policyCopyChangeLog.codingRules.other', 'common.save']);

        TSCompilerUtils.removeDescendantPaths(paths);

        expect(paths).toEqual(new Set(['policyCopyChangeLog.codingRules', 'common.save']));
    });

    it('does not remove paths that only share a prefix with another path', () => {
        const paths = new Set(['policyCopyChangeLog.codingRules', 'policyCopyChangeLog.codingRulesExtra', 'common.save']);

        TSCompilerUtils.removeDescendantPaths(paths);

        expect(paths).toEqual(new Set(['policyCopyChangeLog.codingRules', 'policyCopyChangeLog.codingRulesExtra', 'common.save']));
    });
});
