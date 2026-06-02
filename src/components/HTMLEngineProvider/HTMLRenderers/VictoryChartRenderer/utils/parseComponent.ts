import type {TNode, TRenderEngine} from 'react-native-render-html';

/**
 * Parse an inline HTML attribute into a valid TNode
 */
function parseComponent(attribute: string, renderEngine: TRenderEngine, tagName: string): TNode | undefined {
    if (!attribute) {
        return undefined;
    }
    const tree = renderEngine.buildTTree(attribute);
    const tnode = tree.children.at(0)?.children.at(0)?.children.at(0);
    if (!tnode || tnode.tagName !== tagName) {
        return undefined;
    }
    return tnode;
}

export default parseComponent;
