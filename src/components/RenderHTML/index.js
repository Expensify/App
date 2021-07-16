import React from 'react';
import BaseRenderHTML from './BaseRenderHTML';
import withWindowDimensions from '../withWindowDimensions';
import {
    propTypes,
    defaultProps,
} from './renderHTMLPropTypes';
import canUseTouchScreen from '../../libs/canUseTouchscreen';

const RenderHTML = ({html, debug, isSmallScreenWidth}) => (
    <BaseRenderHTML
        textSelectable={!canUseTouchScreen() || !isSmallScreenWidth}
        html={html}
        debug={debug}
    />
);

RenderHTML.displayName = 'RenderHTML';
RenderHTML.propTypes = propTypes;
RenderHTML.defaultProps = defaultProps;

export default withWindowDimensions(RenderHTML);
