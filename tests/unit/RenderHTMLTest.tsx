import {render} from '@testing-library/react-native';

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
        render(
            <RenderHTML
                html="<strong>test</strong>"
                isSelectable
            />,
        );

        expect(mockConfigProps).toEqual(
            expect.objectContaining({
                defaultTextProps: expect.objectContaining({selectable: true, textBreakStrategy: 'simple'}),
                defaultViewProps: mockInheritedDefaultViewProps,
                enableExperimentalBRCollapsing: true,
                renderers: expect.objectContaining({'mention-user': expect.anything(), emoji: expect.anything()}),
            }),
        );
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
