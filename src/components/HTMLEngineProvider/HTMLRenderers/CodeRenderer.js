import {color} from '@storybook/theming';
import React, {Fragment} from 'react';
import {StyleSheet} from 'react-native';
import {View} from 'react-native';
import {getNativePropsForTNode, splitBoxModelStyle, TNodeChildrenRenderer, useTNodeChildrenProps} from 'react-native-render-html';
import _ from 'underscore';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import InlineCodeBlock from '@components/InlineCodeBlock';
import Text from '@components/Text';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import htmlRendererPropTypes from './htmlRendererPropTypes';

function Code(props) {
    console.log('In Code: ', props);
    return <Text>hello</Text>;
}

const getStyleAtIndex = (idx, length) => {
    if (idx != 0 && idx != length - 1) return {borderLeftWidth: 0, borderRightWidth: 0};
};
function CodeRenderer(props) {
    const styles = useThemeStyles();
    const {TDefaultRenderer, ...defaultRendererProps} = props;

    const nativeProps = getNativePropsForTNode(props);

    const propStyles = splitBoxModelStyle(defaultRendererProps.style);
    const {boxModelStyle, otherStyle: textStyles} = propStyles;
    const textParts = nativeProps.children.split('');

    const borderKeys = {
        top: ['borderTopColor', 'borderTopWidth'],
        bottom: ['borderBottomColor', 'borderBottomWidth'],
        left: ['borderLeftColor', 'borderLeftWidth'],
        right: ['borderRightColor', 'borderRightWidth'],
    };
    const elementStlyes = {
        first: _.pick(boxModelStyle, [...borderKeys.left, ...borderKeys.top, ...borderKeys.bottom, 'borderTopLeftRadius', 'borderBottomLeftRadius', 'paddingLeft']),
        inner: _.pick(boxModelStyle, [...borderKeys.top, ...borderKeys.bottom]),
        last: _.pick(boxModelStyle, [...borderKeys.right, ...borderKeys.top, ...borderKeys.bottom, 'borderTopRightRadius', 'borderBottomRightRadius', 'paddingRight']),
    };

    const backgroundStyle = _.pick(boxModelStyle, ['backgroundColor']);

    const getElementStyle = (idx) => {
        let style = {}
        if (idx === 0) {
            style = elementStlyes.first;
        } else if (idx === textParts.length - 1) {
            style = elementStlyes.last;
        } else {
            style = elementStlyes.inner;
        }
        console.log({...style, ...backgroundStyle})
        return {...style, ...backgroundStyle};
        
    };
    const elements = _.map(textParts, (value, idx) => (
        <View style={[getElementStyle(idx)]}>
            <Text
                style={textStyles}
                key={idx}
            >
                {value}
            </Text>
        </View>
    ));

    return elements;
}

CodeRenderer.propTypes = htmlRendererPropTypes;
CodeRenderer.displayName = 'CodeRenderer';

export default CodeRenderer;
