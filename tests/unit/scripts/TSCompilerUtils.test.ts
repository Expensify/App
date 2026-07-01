import ts from "typescript";
import TSCompilerUtils from "../../../scripts/utils/TSCompilerUtils";

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
  return ts.createSourceFile("test.ts", source, ts.ScriptTarget.Latest, true);
}

function findFirstNode(
  sourceFile: ts.SourceFile,
  predicate: (node: ts.Node) => boolean,
): ts.Node | undefined {
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

function getTemplateStaticText(node: ts.TemplateExpression) {
  let staticText = node.head.text;
  for (const span of node.templateSpans) {
    staticText += span.literal.text;
  }
  return staticText;
}

function findTemplateInPluralOther(sourceFile: ts.SourceFile) {
  return findFirstNode(sourceFile, (node) => {
    if (
      !ts.isTemplateExpression(node) ||
      !getTemplateStaticText(node).includes("merchant rules")
    ) {
      return false;
    }

    const otherProperty = TSCompilerUtils.findAncestor(
      node,
      (ancestor): ancestor is ts.PropertyAssignment => {
        return (
          ts.isPropertyAssignment(ancestor) &&
          ts.isIdentifier(ancestor.name) &&
          ancestor.name.text === "other"
        );
      },
    );

    return !!otherProperty;
  });
}

function findTemplateInPluralOne(sourceFile: ts.SourceFile) {
  return findFirstNode(sourceFile, (node) => {
    if (!ts.isTemplateExpression(node)) {
      return false;
    }

    const staticText = getTemplateStaticText(node);
    if (
      !staticText.includes("merchant rule from") ||
      staticText.includes("merchant rules")
    ) {
      return false;
    }

    const oneProperty = TSCompilerUtils.findAncestor(
      node,
      (ancestor): ancestor is ts.PropertyAssignment => {
        return (
          ts.isPropertyAssignment(ancestor) &&
          ts.isIdentifier(ancestor.name) &&
          ancestor.name.text === "one"
        );
      },
    );

    return !!oneProperty;
  });
}

describe("buildDotNotationPath", () => {
  it("collapses to the function-valued property when a plural form string changes inside other", () => {
    const sourceFile = createSourceFile();
    const templateNode = findTemplateInPluralOther(sourceFile);

    expect(templateNode).toBeDefined();

    const dotPath = TSCompilerUtils.buildDotNotationPath(
      templateNode as ts.Node,
    );

    expect(dotPath).toBe("policyCopyChangeLog.codingRules");
    expect(dotPath).not.toBe("policyCopyChangeLog.codingRules.other");
  });

  it("collapses to the function-valued property when a plural form string changes inside one", () => {
    const sourceFile = createSourceFile();
    const stringNode = findTemplateInPluralOne(sourceFile);

    expect(stringNode).toBeDefined();

    const dotPath = TSCompilerUtils.buildDotNotationPath(stringNode as ts.Node);

    expect(dotPath).toBe("policyCopyChangeLog.codingRules");
    expect(dotPath).not.toBe("policyCopyChangeLog.codingRules.one");
  });

  it("still builds nested paths for ordinary object properties", () => {
    const source = `
const translations = {
    common: {
        save: 'Save',
    },
};
`;
    const sourceFile = createSourceFile(source);
    const saveNode = findFirstNode(
      sourceFile,
      (node) => ts.isStringLiteral(node) && node.text === "Save",
    );

    expect(saveNode).toBeDefined();

    const dotPath = TSCompilerUtils.buildDotNotationPath(saveNode as ts.Node);

    expect(dotPath).toBe("common.save");
  });
});
