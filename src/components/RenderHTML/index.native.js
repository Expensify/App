import React from 'react';
import BaseRenderHTML from './BaseRenderHTML';
import {
    propTypes,
    defaultProps,
} from './renderHTMLPropTypes';

const RenderHTML = ({html, debag}) => (
    <BaseRenderHTML
        html={html}
        debag={debag}
    />
);

RenderHTML.displayName = 'RenderHTML';
RenderHTML.propTypes = propTypes;
RenderHTML.defaultProps = defaultProps;

export default RenderHTML;
