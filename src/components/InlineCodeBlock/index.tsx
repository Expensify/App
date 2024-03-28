import React from 'react';
import {StyleSheet} from 'react-native';
import Text from '@components/Text';
import getCurrentData from './getCurrentData';
import type InlineCodeBlockProps from './types';
import type {TTextOrTPhrasing} from './types';

function InlineCodeBlock<TComponent extends TTextOrTPhrasing>({TDefaultRenderer, textStyle, defaultRendererProps, boxModelStyle}: InlineCodeBlockProps<TComponent>) {
    const flattenTextStyle = StyleSheet.flatten(textStyle);
    const {textDecorationLine, ...textStyles} = flattenTextStyle;

    const data = getCurrentData(defaultRendererProps);
    const numberOfLines = defaultRendererProps.propsFromParent?.numberOfLines;

    return (
        <TDefaultRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...defaultRendererProps}
        >
            <Text
                numberOfLines={numberOfLines}
                style={[boxModelStyle, textStyles]}
            >
                {data}
            </Text>
        </TDefaultRenderer>
    );
}

InlineCodeBlock.displayName = 'InlineCodeBlock';

export default InlineCodeBlock;
