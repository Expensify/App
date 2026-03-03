import {render} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';

jest.mock('@hooks/useWindowDimensions', () => () => ({windowWidth: 400}));
jest.mock('react-native-render-html', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const {View: MockView} = require('react-native');
    return {
        RenderHTMLConfigProvider: ({children}: {children: React.ReactNode}) => children,
        RenderHTMLSource: () => <MockView />,
    };
});

const mockUseHasTextAncestor = jest.fn(() => false);
jest.mock('@hooks/useHasTextAncestor', () => () => mockUseHasTextAncestor());

describe('RenderHTML', () => {
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
});
