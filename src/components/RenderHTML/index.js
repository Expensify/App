import React from 'react';
import BaseRenderHTML from './BaseRenderHTML';
import withWindowDimensions from '../withWindowDimensions';
import {
    propTypes,
    defaultProps,
} from './renderHTMLPropTypes';

const RenderHTML = ({html, debug, isSmallScreenWidth}) => (
    <BaseRenderHTML
        textSelectable={!isSmallScreenWidth}
        html={html}
        debug={debug}
    />
);

RenderHTML.displayName = 'RenderHTML';
RenderHTML.propTypes = propTypes;
RenderHTML.defaultProps = defaultProps;

export default withWindowDimensions(RenderHTML);
