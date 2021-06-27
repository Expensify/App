import React from 'react';
import BaseRenderHTML from './BaseRenderHTML';
import withWindowDimensions from '../withWindowDimensions';
import {
    propTypes,
    defaultProps,
} from './renderHTMLPropTypes';

const RenderHTML = ({html, debag, isSmallScreenWidth}) => (
    <BaseRenderHTML
        textSelectable={!isSmallScreenWidth}
        html={html}
        debag={debag}
    />
);

RenderHTML.displayName = 'RenderHTML';
RenderHTML.propTypes = propTypes;
RenderHTML.defaultProps = defaultProps;

export default withWindowDimensions(RenderHTML);
