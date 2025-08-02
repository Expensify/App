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
        // Sanitize emoji characters already wrapped in <emoji> tags to prevent double-tagging.
        const sanitizedHtml = htmlParam.replaceAll(/<\/?emoji>/g, '');
        return Parser.replace(sanitizedHtml, {shouldEscapeText: false, filterRules: ['emoji']});
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
