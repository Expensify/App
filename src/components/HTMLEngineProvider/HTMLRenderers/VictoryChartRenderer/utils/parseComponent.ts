import {HTMLContentModel} from '@native-html/render';
import type {HTMLContentModel as HTMLContentModelType, TNode, TRenderEngine} from '@native-html/render';

/**
 * Parse an inline HTML attribute into a valid TNode
 */
function parseComponent(attribute: string, renderEngine: TRenderEngine, tagName: string, contentModel: HTMLContentModelType): TNode | undefined {
    if (!attribute) {
        return undefined;
    }
    const tree = renderEngine.buildTTree(attribute);
    let tnode: TNode | undefined;
    switch (contentModel) {
        case HTMLContentModel.textual:
            tnode = tree.children.at(0)?.children.at(0)?.children.at(0);
            break;
        default:
            tnode = tree.children.at(0)?.children.at(0);
    }
    if (!tnode || tnode.tagName !== tagName) {
        return undefined;
    }
    return tnode;
}

export default parseComponent;
