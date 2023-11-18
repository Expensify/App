import React, { Fragment } from 'react';
import {splitBoxModelStyle} from 'react-native-render-html';
import _ from 'underscore';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import * as StyleUtils from '@styles/StyleUtils';
import htmlRendererPropTypes from './htmlRendererPropTypes';
import InlineCodeBlock from '@components/InlineCodeBlock';
import Text from '@components/Text';
import { StyleSheet } from 'react-native';
import { color } from '@storybook/theming';

function CodeRenderer(props) {
    // We split wrapper and inner styles
    // "boxModelStyle" corresponds to border, margin, padding and backgroundColor
    const {boxModelStyle, otherStyle: textStyle} = splitBoxModelStyle(props.style);

    // Get the correct fontFamily variant based in the fontStyle and fontWeight
    const font = StyleUtils.getFontFamilyMonospace({
        fontStyle: textStyle.fontStyle,
        fontWeight: textStyle.fontWeight,
    });

    // Determine the font size for the code based on whether it's inside an H1 element.
    const isInsideH1 = HTMLEngineUtils.isChildOfH1(props.tnode);

    const fontSize = StyleUtils.getCodeFontSize(isInsideH1);

    const textStyleOverride = {
        fontSize,
        fontFamily: font,

        // We need to override this properties bellow that was defined in `textStyle`
        // Because by default the `react-native-render-html` add a style in the elements,
        // for example the <strong> tag has a fontWeight: "bold" and in the android it break the font
        fontWeight: undefined,
        fontStyle: undefined,
    };

    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'style']);
    const TDefaultRenderer = props.TDefaultRenderer;
    const message = defaultRendererProps.tnode.data

    // const message = 'fsjdhfauilfnqe;kjnfqqfssjdhfauilfnqe;kjnfqqsjdhfauilfnqe;kjnfqqfsjdhfauilfnqe;kjnfqqffjdhfauilfnqe;kjnfqqf'
    const elements = _.map(message.split(''), (value, idx) => <Text style={inlineStyle.textStyle} key={idx}>{value}</Text>)
    console.error(props);
    return (
        <>
        <Text style={inlineStyle.textContainer}>{elements}</Text>
       </>
    );
}

const inlineStyle = StyleSheet.create({
    textContainer: {
        // flexDirection: 'row',
        paddingTop: 10,
        backgroundColor: 'yellow',
        color: 'red',
        justifyContent: 'center'
    },
    textStyle: {
        color: 'red',
        fontSize: 10,
    }
})
CodeRenderer.propTypes = htmlRendererPropTypes;
CodeRenderer.displayName = 'CodeRenderer';

export default CodeRenderer;
