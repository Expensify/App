import React from 'react';
import BaseRenderHTML from './BaseRenderHTML';
import {
    propTypes,
    defaultProps,
} from './renderHTMLPropTypes';

const RenderHTML = ({html, debug}) => (
    <BaseRenderHTML
        html={html}
        debug={debug}
    />
);

RenderHTML.displayName = 'RenderHTML';
RenderHTML.propTypes = propTypes;
RenderHTML.defaultProps = defaultProps;

export default RenderHTML;
