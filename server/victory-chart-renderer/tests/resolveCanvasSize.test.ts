import {expect, test} from 'bun:test';
import type {TNode} from 'react-native-render-html';
import resolveCanvasSize from '../src/resolveCanvasSize';

function makeChartNode(attributes: TNode['attributes'], children: TNode[] = []): TNode {
    return {
        tagName: 'victorychart',
        attributes,
        children,
    } as unknown as TNode;
}

test('resolveCanvasSize reads width and height from victorychart', () => {
    const tnode = makeChartNode({width: '680', height: '530'});

    expect(resolveCanvasSize(tnode)).toEqual({width: 680, height: 530});
});

test('resolveCanvasSize defaults to 600x400 when dimensions are omitted', () => {
    const tnode = makeChartNode({});

    expect(resolveCanvasSize(tnode)).toEqual({width: 600, height: 400});
});

test('resolveCanvasSize throws when overlays exist without chart dimensions', () => {
    const tnode = makeChartNode({}, [
        {
            tagName: 'victorylabel',
            attributes: {x: '10', y: '20', text: 'Title'},
            children: [],
        } as unknown as TNode,
    ]);

    expect(() => resolveCanvasSize(tnode)).toThrow('require explicit width and height');
});
