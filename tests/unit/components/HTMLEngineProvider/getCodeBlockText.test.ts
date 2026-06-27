import type {TNode} from 'react-native-render-html';
import {getCodeBlockText} from '@components/HTMLEngineProvider/htmlEngineUtils';

/** Build a text node carrying raw `data`. */
function textNode(data: string): TNode {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- minimal mock that only exposes the fields getCodeBlockText reads
    return {data} as unknown as TNode;
}

/** Build a void `<br>` node (no data, no children). */
function brNode(): TNode {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- minimal mock that only exposes the fields getCodeBlockText reads
    return {tagName: 'br'} as unknown as TNode;
}

/** Build a container node with children. */
function containerNode(children: TNode[]): TNode {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- minimal mock that only exposes the fields getCodeBlockText reads
    return {children} as unknown as TNode;
}

describe('getCodeBlockText', () => {
    it('returns the raw data of a single text node', () => {
        expect(getCodeBlockText(textNode('const hello = "world";'))).toBe('const hello = "world";');
    });

    it('joins text nodes and converts <br> to newlines', () => {
        const tnode = containerNode([textNode('line1'), brNode(), textNode('line2')]);
        expect(getCodeBlockText(tnode)).toBe('line1\nline2');
    });

    it('returns an empty string for an empty block', () => {
        expect(getCodeBlockText(containerNode([]))).toBe('');
    });

    it('returns an empty string for a node with neither data nor children', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- minimal mock that only exposes the fields getCodeBlockText reads
        expect(getCodeBlockText({} as unknown as TNode)).toBe('');
    });

    it('preserves leading/trailing whitespace', () => {
        expect(getCodeBlockText(textNode('  spaced  '))).toBe('  spaced  ');
    });

    it('collects text from deeply nested nodes', () => {
        const tnode = containerNode([textNode('a'), containerNode([textNode('b'), brNode(), textNode('c')]), textNode('d')]);
        expect(getCodeBlockText(tnode)).toBe('ab\ncd');
    });

    it('keeps a trailing newline produced by a closing <br>', () => {
        const tnode = containerNode([textNode('last'), brNode()]);
        expect(getCodeBlockText(tnode)).toBe('last\n');
    });
});
