import type {TNode} from 'react-native-render-html';

import {describe, expect, test} from 'bun:test';

import resolveCanvasSize from '../src/resolveCanvasSize';

function makeChartNode(attributes: TNode['attributes'], children: TNode[] = []): TNode {
    return {
        tagName: 'victorychart',
        attributes,
        children,
    } as unknown as TNode;
}

describe('resolveCanvasSize', () => {
    describe('valid dimensions', () => {
        test('reads width and height from victorychart', () => {
            const tnode = makeChartNode({width: '680', height: '530'});

            expect(resolveCanvasSize(tnode)).toEqual({width: 680, height: 530});
        });

        test('defaults to 600x400 when dimensions are omitted', () => {
            const tnode = makeChartNode({});

            expect(resolveCanvasSize(tnode)).toEqual({width: 600, height: 400});
        });
    });

    describe('validation errors', () => {
        test('throws when overlays exist without chart dimensions', () => {
            const tnode = makeChartNode({}, [
                {
                    tagName: 'victorylabel',
                    attributes: {x: '10', y: '20', text: 'Title'},
                    children: [],
                } as unknown as TNode,
            ]);

            expect(() => resolveCanvasSize(tnode)).toThrow('require explicit width and height');
        });

        test('throws when width has a non-numeric unit suffix', () => {
            const tnode = makeChartNode({width: '600px', height: '400'});

            expect(() => resolveCanvasSize(tnode)).toThrow('width and height must both be provided together');
        });

        test('throws when width is zero', () => {
            const tnode = makeChartNode({width: '0', height: '400'});

            expect(() => resolveCanvasSize(tnode)).toThrow('width and height must be positive numbers');
        });

        test('throws when only width is provided', () => {
            const tnode = makeChartNode({width: '680'});

            expect(() => resolveCanvasSize(tnode)).toThrow('width and height must both be provided together');
        });

        test('throws when overlay has non-numeric coordinates and chart dimensions are missing', () => {
            const tnode = makeChartNode({}, [
                {
                    tagName: 'victorylabel',
                    attributes: {x: 'not-a-number', y: '20', text: 'Title'},
                    children: [],
                } as unknown as TNode,
            ]);

            expect(() => resolveCanvasSize(tnode)).toThrow('require explicit width and height');
        });
    });
});
