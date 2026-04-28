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
 * Emits one anchor per word/whitespace run inside text nodes and one per
 * atomic-tag subtree. Formatting elements (<strong>, <em>, ...) recurse so
 * bold appears as words become bold, rather than in one jump.
 */
function collectAnchors(doc: Document): Anchor[] {
    const anchors: Anchor[] = [];
    const visit = (node: AnyNode, path: number[]): void => {
        if (node.type === ElementType.Text) {
            const text = node.data;
            if (text.length === 0) {
                return;
            }
            // Splitting on \s alone would coalesce adjacent words around a
            // single space; matching word-or-whitespace runs keeps each word
            // a separate reveal step.
            const re = /\S+|\s+/g;
            let match = re.exec(text);
            while (match !== null) {
                anchors.push({path: path.slice(), textEndIdx: match.index + match[0].length});
                match = re.exec(text);
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
        for (let i = 0; i < elem.children.length; i++) {
            const child = elem.children.at(i);
            if (child) {
                visit(child, [...path, i]);
            }
        }
    };
    for (let i = 0; i < doc.children.length; i++) {
        const child = doc.children.at(i);
        if (child) {
            visit(child, [i]);
        }
    }
    return anchors;
}

/**
 * Builds a partial node forest up to and including `anchor`, truncating the
 * leaf text node at the anchor offset. Only the path branch is shallow-cloned
 * with a new children array; sibling references stay untouched so
 * dom-serializer renders them as-is.
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
 * Pre-computes progressive HTML stages with word-level granularity. Formatting
 * wrappers (<strong>, <em>, ...) recurse so bold reveals progressively;
 * atomic primitives (mentions, emoji, links, code, images) stay whole.
 * Stage 0 is empty; the final stage equals the input.
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
