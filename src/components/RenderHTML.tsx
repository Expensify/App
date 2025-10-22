import React, {useMemo} from 'react';
import {RenderHTMLSource} from 'react-native-render-html';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Parser from '@libs/Parser';

type RenderHTMLProps = {
    /** HTML string to render */
    html: string;
};

// We are using the explicit composite architecture for performance gains.
// Configuration for RenderHTML is handled in a top-level component providing
// context to RenderHTMLSource components. See https://git.io/JRcZb
// The provider is available at src/components/HTMLEngineProvider/
function RenderHTML({html: htmlParam}: RenderHTMLProps) {
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
    return (
        <RenderHTMLSource
            contentWidth={windowWidth * 0.8}
            source={{html}}
        />
    );
}

RenderHTML.displayName = 'RenderHTML';

export default RenderHTML;
