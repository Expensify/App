import React, {useMemo} from 'react';
import {RenderHTMLConfigProvider, RenderHTMLSource} from 'react-native-render-html';
import type {RenderersProps} from 'react-native-render-html';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Parser from '@libs/Parser';

type LinkPressHandler = NonNullable<RenderersProps['a']>['onPress'];

type RenderHTMLProps = {
    /** HTML string to render */
    html: string;

    /** Callback to handle link press */
    onLinkPress?: LinkPressHandler;
};

// We are using the explicit composite architecture for performance gains.
// Configuration for RenderHTML is handled in a top-level component providing
// context to RenderHTMLSource components. See https://git.io/JRcZb
// The provider is available at src/components/HTMLEngineProvider/
function RenderHTML({html: htmlParam, onLinkPress}: RenderHTMLProps) {
    const {windowWidth} = useWindowDimensions();
    const html = useMemo(() => {
        return (
            Parser.replace(htmlParam, {shouldEscapeText: false, filterRules: ['emoji']})
                // Escape brackets when pasting a link, since unescaped [] can break Markdown link syntax
                .replace(/&amp;#91;/g, '[')
                .replace(/&amp;#93;/g, ']')
                // Remove double <emoji> tag if exists and keep the outermost tag (always the original tag).
                .replace(/(<emoji[^>]*>)(?:<emoji[^>]*>)+/g, '$1')
                .replace(/(<\/emoji[^>]*>)(?:<\/emoji[^>]*>)+/g, '$1')
        );
    }, [htmlParam]);

    const renderersProps = useMemo(() => {
        return {
            a: {
                onPress: onLinkPress,
            },
        };
    }, [onLinkPress]);

    return (
        <RenderHTMLConfigProvider renderersProps={renderersProps}>
            <RenderHTMLSource
                contentWidth={windowWidth * 0.8}
                source={{html}}
            />
        </RenderHTMLConfigProvider>
    );
}

RenderHTML.displayName = 'RenderHTML';

export default RenderHTML;
