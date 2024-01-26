import React from 'react';
import {RenderHTMLSource} from 'react-native-render-html';
import useWindowDimensions from '@hooks/useWindowDimensions';

type RenderHTMLProps = {
    /** HTML string to render */
    html: string;
};

// We are using the explicit composite architecture for performance gains.
// Configuration for RenderHTML is handled in a top-level component providing
// context to RenderHTMLSource components. See https://git.io/JRcZb
// The provider is available at src/components/HTMLEngineProvider/
function RenderHTML({html}: RenderHTMLProps) {
    const {windowWidth} = useWindowDimensions();
    return (
        <RenderHTMLSource
            contentWidth={windowWidth * 0.8}
            source={{html}}
        />
    );
}

RenderHTML.displayName = 'RenderHTML';

export default RenderHTML;
