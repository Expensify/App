import {render} from '@testing-library/react-native';

import BaseHTMLEngineProvider from '@components/HTMLEngineProvider/BaseHTMLEngineProvider';
import HTMLRenderersContext from '@components/HTMLEngineProvider/HTMLRenderersContext';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';

import React from 'react';
import {View} from 'react-native';

jest.mock('@hooks/useWindowDimensions', () => () => ({windowWidth: 400}));
const mockInheritedDefaultTextProps = {selectable: false, textBreakStrategy: 'simple'};
const mockInheritedDefaultViewProps = {testID: 'html-view'};
let mockConfigProps:
    | {
          defaultTextProps?: {selectable?: boolean; textBreakStrategy?: string};
          defaultViewProps?: {testID?: string};
          enableExperimentalBRCollapsing?: boolean;
          renderers?: Record<string, unknown>;
          renderersProps?: {a?: {onPress?: unknown}};
      }
    | undefined;
jest.mock('react-native-render-html', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View: MockView} = require('react-native');
    return {
        HTMLContentModel: {block: 'block', mixed: 'mixed', none: 'none', textual: 'textual'},
        HTMLElementModel: {fromCustomModel: (model: unknown) => model},
        TRenderEngineProvider: ({children}: {children: React.ReactNode}) => children,
        RenderHTMLConfigProvider: ({children, ...configProps}: {children: React.ReactNode}) => {
            mockConfigProps = configProps;
            return children;
        },
        RenderHTMLSource: () => <MockView />,
        useSharedProps: () => ({
            defaultTextProps: mockInheritedDefaultTextProps,
            defaultViewProps: mockInheritedDefaultViewProps,
            enableExperimentalBRCollapsing: true,
        }),
    };
});

const mockUseHasTextAncestor = jest.fn(() => false);
jest.mock('@hooks/useHasTextAncestor', () => () => mockUseHasTextAncestor());

describe('RenderHTML', () => {
    beforeEach(() => {
        mockConfigProps = undefined;
        mockUseHasTextAncestor.mockReturnValue(false);
    });

    it('throws when rendered inside a Text ancestor', () => {
        mockUseHasTextAncestor.mockReturnValue(true);
        expect(() =>
            render(
                <Text>
                    <RenderHTML html="<p>test</p>" />
                </Text>,
            ),
        ).toThrow('RenderHTML must not be rendered inside a <Text> component');
    });

    it('does not throw when rendered outside a Text ancestor', () => {
        mockUseHasTextAncestor.mockReturnValue(false);
        expect(() =>
            render(
                <View>
                    <RenderHTML html="<p>test</p>" />
                </View>,
            ),
        ).not.toThrow();
    });

    it('enables selection while preserving inherited HTML configuration', () => {
        // Given the renderer registry that BaseHTMLEngineProvider puts in HTMLRenderersContext
        const registry = {emoji: () => null};

        // When selectable HTML is rendered under it
        render(
            <HTMLRenderersContext.Provider value={registry}>
                <RenderHTML
                    html="<strong>test</strong>"
                    isSelectable
                />
            </HTMLRenderersContext.Provider>,
        );

        // Then the nested config provider keeps the inherited config and gets the same registry, because it replaces the parent's renderers wholesale
        expect(mockConfigProps).toEqual(
            expect.objectContaining({
                defaultTextProps: expect.objectContaining({selectable: true, textBreakStrategy: 'simple'}),
                defaultViewProps: mockInheritedDefaultViewProps,
                enableExperimentalBRCollapsing: true,
            }),
        );
        expect(mockConfigProps?.renderers).toBe(registry);
    });

    it('gives selectable HTML the app renderer registry from BaseHTMLEngineProvider', () => {
        // Given selectable HTML rendered inside the real app HTML provider
        // When the nested config provider for selectable HTML mounts
        render(
            <BaseHTMLEngineProvider>
                <RenderHTML
                    html="<strong>test</strong>"
                    isSelectable
                />
            </BaseHTMLEngineProvider>,
        );

        // Then it gets the app's custom renderers, because without them mentions and emoji in selectable HTML would render as plain tags
        expect(mockConfigProps?.defaultTextProps).toMatchObject({selectable: true});
        expect(mockConfigProps?.renderers).toHaveProperty('mention-user');
        expect(mockConfigProps?.renderers).toHaveProperty('emoji');
    });

    it('preserves the existing renderer path when handling link presses', () => {
        const onLinkPress = jest.fn();

        render(
            <RenderHTML
                html='<a href="https://example.com">test</a>'
                onLinkPress={onLinkPress}
            />,
        );

        expect(mockConfigProps?.renderersProps?.a?.onPress).toBe(onLinkPress);
        expect(mockConfigProps?.renderers).not.toHaveProperty('a');
        expect(mockConfigProps?.renderers).toHaveProperty('bullet-item');
    });
});
