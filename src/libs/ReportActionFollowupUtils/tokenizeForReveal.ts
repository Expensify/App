import render from 'dom-serializer';
import {ElementType} from 'domelementtype';
import type {AnyNode, Document, Element as DomElement} from 'domhandler';
import {parseDocument} from 'htmlparser2';

/**
 * Tags rendered atomically — splitting their content mid-element looks broken
 * (e.g. half a mention, a partial emoji codepoint, a link with no closing tag).
 * Mentions/emoji/img are visual primitives, <a> is a structural target with a
 * URL, <code> is a literal text run that shouldn't reflow as words trickle in.
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
 * Walk the DOM in document order, emitting one anchor per "word or whitespace
 * run" inside text nodes and one anchor for each whole atomic-tag subtree.
 * Block / formatting elements (<p>, <ol>, <strong>, <em>, ...) recurse so
 * their inner words become anchors with the wrapper preserved on render —
 * that's what makes bold appear as words become bold rather than as a single
 * jump.
 */
function collectAnchors(doc: Document): Anchor[] {
    const anchors: Anchor[] = [];
    const visit = (node: AnyNode, path: number[]): void => {
        if (node.type === ElementType.Text) {
            const text = node.data;
            if (text.length === 0) {
                return;
            }
            // Word-or-whitespace runs — each run advances the visible content
            // by one perceptual unit. Splitting on \s alone would coalesce
            // multiple words around a single space; this keeps the reveal
            // granular without breaking on character boundaries.
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
 * Build a partial node forest containing every node up to (and including)
 * `anchor`, with any text-node leaf truncated to the anchor's offset.
 *
 * Reconstructs only the path elements: siblings before the path branch are
 * cloned by reference (rendered fully), the path branch is shallow-cloned
 * with its `children` array replaced. Sibling references are unchanged so
 * dom-serializer renders them via their existing structure — no parent/next
 * pointer surgery needed.
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
 * Pre-computes a list of progressive HTML stages for a pregenerated Concierge
 * response — usePendingConciergeResponse trickles them in over the follow-up
 * generation window so the chat keeps moving while the server works.
 *
 * Word-level granularity within text nodes (ChatGPT-style streaming feel),
 * recursing into formatting wrappers like <strong>/<em> so bold appears as
 * words become bold rather than in one jump. Atomic visual primitives
 * (mentions, emoji, links, code, images) stay whole — no half-rendered
 * mention or partial emoji codepoint.
 *
 * Stage 0 is empty; the final stage equals the rendered children. The hook
 * walks indices 0..N-1 across the trickle duration via an ease-out curve.
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
