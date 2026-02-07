import {render} from '@testing-library/react-native';
import React from 'react';
import {unstable_TextAncestorContext as TextAncestorContext, View} from 'react-native';
import RenderHTML from '@components/RenderHTML';

jest.mock('@hooks/useWindowDimensions', () => () => ({windowWidth: 400}));
jest.mock('react-native-render-html', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const {View: MockView} = require('react-native');
    return {
        RenderHTMLConfigProvider: ({children}: {children: React.ReactNode}) => children,
        RenderHTMLSource: () => <MockView />,
    };
});

describe('RenderHTML', () => {
    it('throws when rendered inside a Text ancestor', () => {
        expect(() =>
            render(
                <TextAncestorContext value>
                    <RenderHTML html="<p>test</p>" />
                </TextAncestorContext>,
            ),
        ).toThrow('RenderHTML must not be rendered inside a <Text> component');
    });

    it('does not throw when rendered outside a Text ancestor', () => {
        expect(() =>
            render(
                <View>
                    <RenderHTML html="<p>test</p>" />
                </View>,
            ),
        ).not.toThrow();
    });
});
