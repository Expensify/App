import React from 'react';
import {StyleSheet} from 'react-native';
import type {TText} from 'react-native-render-html';
import Text from '@components/Text';
import type InlineCodeBlockProps from './types';

function InlineCodeBlock<TComponent extends TText>({TDefaultRenderer, textStyle, defaultRendererProps, boxModelStyle}: InlineCodeBlockProps<TComponent>) {
    const flattenTextStyle = StyleSheet.flatten(textStyle);
    const {textDecorationLine, ...textStyles} = flattenTextStyle;

    return (
        <TDefaultRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...defaultRendererProps}
        >
            <Text style={[boxModelStyle, textStyles]}>{defaultRendererProps.tnode.data}</Text>
        </TDefaultRenderer>
    );
}

InlineCodeBlock.displayName = 'InlineCodeBlock';

export default InlineCodeBlock;
