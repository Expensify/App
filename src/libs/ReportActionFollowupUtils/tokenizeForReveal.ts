import render from 'dom-serializer';
import {ElementType} from 'domelementtype';
import type {AnyNode, Document, Element as DomElement} from 'domhandler';
import {parseDocument} from 'htmlparser2';

/**
 * Tags whose content can't be split mid-element without looking broken
 * (half mention, partial emoji codepoint, anchor without its URL).
 */
const ATOMIC_TAGS = new Set(['mention-user', 'mention-report', 'emoji', 'a', 'code', 'img']);

/**
 * One reveal point. `path` is the index path from the doc root to the anchor
 * node; `textEndIdx` (when present) is the character offset to truncate that
 * node's text data to.
 */
type Anchor = {
    path: number[];
    textEndIdx?: number;
};

/**
 * Emits one anchor per character inside text nodes and one per atomic-tag
 * subtree. Formatting elements (<strong>, <em>, ...) recurse so bold appears
 * progressively rather than in one jump.
 */
function collectAnchors(doc: Document): Anchor[] {
    const anchors: Anchor[] = [];
    const visit = (node: AnyNode, path: number[]): void => {
        if (node.type === ElementType.Text) {
            const text = node.data;
            if (text.length === 0) {
                return;
            }
            // One anchor per character — atomic tags below emit a single anchor
            // per subtree, so mentions/emoji/anchors/code stay whole.
            for (let i = 1; i <= text.length; i += 1) {
                anchors.push({path: path.slice(), textEndIdx: i});
            }
            return;
        }
        if (node.type !== ElementType.Tag) {
            return;
        }
        const elem = node;
        const tagName = elem.name.toLowerCase();
        if (ATOMIC_TAGS.has(tagName)) {
            anchors.push({path: path.slice()});
            return;
        }
        if (!elem.children || elem.children.length === 0) {
            anchors.push({path: path.slice()});
            return;
        }
        for (const [i, child] of elem.children.entries()) {
            visit(child, [...path, i]);
        }
    };
    for (const [i, child] of doc.children.entries()) {
        visit(child, [i]);
    }
    return anchors;
}

/**
 * Builds a partial node forest up to `anchor`. Only the path branch is
 * shallow-cloned; siblings stay referentially equal for dom-serializer.
 */
function buildClippedNodes(doc: Document, anchor: Anchor): AnyNode[] {
    const clip = (siblings: readonly AnyNode[], depth: number): AnyNode[] => {
        const idx = anchor.path.at(depth) ?? 0;
        const isLeaf = depth === anchor.path.length - 1;
        const before = siblings.slice(0, idx);
        const stopNode = siblings.at(idx);
        if (!stopNode) {
            return [...before];
        }
        if (isLeaf) {
            if (stopNode.type === ElementType.Text && anchor.textEndIdx !== undefined) {
                const truncated = {...stopNode, data: stopNode.data.slice(0, anchor.textEndIdx)} as unknown as AnyNode;
                return [...before, truncated];
            }
            return [...before, stopNode];
        }
        const elem = stopNode as DomElement;
        const innerChildren = clip(elem.children as AnyNode[], depth + 1);
        const partialElem = {...elem, children: innerChildren} as unknown as AnyNode;
        return [...before, partialElem];
    };
    return clip(doc.children as AnyNode[], 0);
}

/**
 * Pre-computes progressive HTML stages at character granularity. Atomic
 * primitives (mentions, emoji, links, code, images) stay whole.
 */
function tokenizeForReveal(html: string): string[] {
    if (!html) {
        return [''];
    }
    const doc = parseDocument(html);
    const anchors = collectAnchors(doc);
    const stages: string[] = [''];
    for (const anchor of anchors) {
        stages.push(render(buildClippedNodes(doc, anchor)));
    }
    return stages;
}

export default tokenizeForReveal;
