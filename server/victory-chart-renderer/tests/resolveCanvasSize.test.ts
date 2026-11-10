import {describe, expect, test} from 'bun:test';

import type {TNode} from 'react-native-render-html';

import createMock from 'tests/utils/createMock';

import resolveCanvasSize from '../src/resolveCanvasSize';

function makeChartNode(attributes: TNode['attributes'], children: TNode[] = []): TNode {
    return createMock<TNode>({
        tagName: 'victorychart',
        attributes,
        children,
    });
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

        test('accepts dimensions at the 4096 limit', () => {
            // Given a chart exactly at the maximum allowed size
            const tnode = makeChartNode({width: '4096', height: '4096'});

            // When the canvas size is resolved
            // Then the limit itself is still rendered, so only larger charts are rejected
            expect(resolveCanvasSize(tnode)).toEqual({width: 4096, height: 4096});
        });
    });

    describe('validation errors', () => {
        test('throws when overlays exist without chart dimensions', () => {
            const tnode = makeChartNode({}, [
                createMock<TNode>({
                    tagName: 'victorylabel',
                    attributes: {x: '10', y: '20', text: 'Title'},
                    children: [],
                }),
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

        const oversizedCases: Array<{label: string; attributes: TNode['attributes']}> = [
            {label: 'width', attributes: {width: '4097', height: '430'}},
            {label: 'height', attributes: {width: '680', height: '16000'}},
            {label: 'width written as an exponent', attributes: {width: '1e9', height: '430'}},
        ];

        for (const {label, attributes} of oversizedCases) {
            test(`throws when ${label} exceeds the maximum`, () => {
                // Given a chart whose size would make the renderer allocate a huge surface
                const tnode = makeChartNode(attributes);

                // When the canvas size is resolved
                // Then it is rejected before any surface is allocated
                expect(() => resolveCanvasSize(tnode)).toThrow('width and height must not exceed 4096');
            });
        }

        test('throws when only width is provided', () => {
            const tnode = makeChartNode({width: '680'});

            expect(() => resolveCanvasSize(tnode)).toThrow('width and height must both be provided together');
        });

        test('throws when overlay has non-numeric coordinates and chart dimensions are missing', () => {
            const tnode = makeChartNode({}, [
                createMock<TNode>({
                    tagName: 'victorylabel',
                    attributes: {x: 'not-a-number', y: '20', text: 'Title'},
                    children: [],
                }),
            ]);

            expect(() => resolveCanvasSize(tnode)).toThrow('require explicit width and height');
        });
    });
});
