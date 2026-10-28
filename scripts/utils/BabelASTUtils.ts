type ASTNode = {
    type: string;
    start: number;
    end: number;
    [key: string]: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isASTNode(value: unknown): value is ASTNode {
    if (!isRecord(value)) {
        return false;
    }
    return typeof value.type === 'string' && typeof value.start === 'number' && typeof value.end === 'number';
}

/**
 * Yield every direct AST child of `node`. `nonChildKeys` excludes location/metadata fields (and any
 * parser-specific extras, e.g. a top-level `comments` array) that aren't part of the tree shape.
 */
function* children(node: ASTNode, nonChildKeys: ReadonlySet<string>): Generator<ASTNode> {
    for (const [key, value] of Object.entries(node)) {
        if (nonChildKeys.has(key)) {
            continue;
        }
        for (const child of Array.isArray(value) ? value : [value]) {
            if (isASTNode(child)) {
                yield child;
            }
        }
    }
}

const BabelASTUtils = {
    isRecord,
    isASTNode,
    children,
};

export default BabelASTUtils;
export type {ASTNode};
