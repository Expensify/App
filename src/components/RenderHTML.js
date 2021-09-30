import React from 'react';
import {useWindowDimensions} from 'react-native';
import PropTypes from 'prop-types';
import {RenderHTMLSource} from 'react-native-render-html';

// We are using the explicit composite architecture for performance gains.
// Configuration for RenderHTML is handled in a top-level component providing
// context to RenderHTMLSource components. See https://git.io/JRcZb
// The provider is available at src/components/HTMLEngineProvider/
const RenderHTML = ({html}) => {
    const {width} = useWindowDimensions();
    return (
        <RenderHTMLSource
            contentWidth={width * 0.8}
            source={{html}}
        />
    );
};

RenderHTML.displayName = 'RenderHTML';
RenderHTML.propTypes = {
    /** HTML string to render */
    html: PropTypes.string.isRequired,
};
RenderHTML.defaultProps = {};

export default RenderHTML;
