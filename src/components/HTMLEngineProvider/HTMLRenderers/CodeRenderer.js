import _ from 'underscore';
import React from 'react';
import {splitBoxModelStyle} from 'react-native-render-html';
import htmlRendererPropTypes from './htmlRendererPropTypes';
import * as StyleUtils from '../../../styles/StyleUtils';
import InlineCodeBlock from '../../InlineCodeBlock';

const CodeRenderer = (props) => {
    // We split wrapper and inner styles
    // "boxModelStyle" corresponds to border, margin, padding and backgroundColor
    const {boxModelStyle, otherStyle: textStyle} = splitBoxModelStyle(props.style);

    // Get the correct fontFamily variant based in the fontStyle and fontWeight
    const font = StyleUtils.getFontFamilyMonospace({
        fontStyle: textStyle.fontStyle,
        fontWeight: textStyle.fontWeight,
    });

    const textStyleOverride = {
        fontFamily: font,

        // We need to override this properties bellow that was defined in `textStyle`
        // Because by default the `react-native-render-html` add a style in the elements,
        // for example the <strong> tag has a fontWeight: "bold" and in the android it break the font
        fontWeight: undefined,
        fontStyle: undefined,
    };

    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'style']);

    return (
        <InlineCodeBlock
            defaultRendererProps={defaultRendererProps}
            TDefaultRenderer={props.TDefaultRenderer}
            boxModelStyle={boxModelStyle}
            textStyle={{...textStyle, ...textStyleOverride}}
            key={props.key}
        />
    );
};

CodeRenderer.propTypes = htmlRendererPropTypes;
CodeRenderer.displayName = 'CodeRenderer';

export default CodeRenderer;
