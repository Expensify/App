import React from 'react';
import PropTypes from 'prop-types';
import {RenderHTMLSource} from 'react-native-render-html';
import useWindowDimensions from '../hooks/useWindowDimensions';

const propTypes = {
    /** HTML string to render */
    html: PropTypes.string.isRequired,
};

// We are using the explicit composite architecture for performance gains.
// Configuration for RenderHTML is handled in a top-level component providing
// context to RenderHTMLSource components. See https://git.io/JRcZb
// The provider is available at src/components/HTMLEngineProvider/
const RenderHTML = (props) => {
    const {windowWidth} = useWindowDimensions();
    return (
        <RenderHTMLSource
            contentWidth={windowWidth * 0.8}
            source={{html: props.html}}
        />
    );
};

RenderHTML.displayName = 'RenderHTML';
RenderHTML.propTypes = propTypes;
RenderHTML.defaultProps = {};

export default RenderHTML;
