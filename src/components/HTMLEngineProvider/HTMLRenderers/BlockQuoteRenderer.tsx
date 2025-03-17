import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

function BlockQuoteRenderer({TDefaultRenderer, style, tnode, ...props}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();
    const isChildOfTaskTitle = HTMLEngineUtils.isChildOfTaskTitle(tnode);

    return isChildOfTaskTitle ? (
        <TNodeChildrenRenderer
            tnode={tnode}
            renderChild={(props2) => {
                return (
                    <Text
                        style={[styles.webViewStyles.baseFontStyle]}
                        key={props2.key}
                    >
                        {props2.childElement}
                    </Text>
                );
            }}
        />
    ) : (
        <TDefaultRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            tnode={tnode}
            style={[style as StyleProp<TextStyle>]}
        />
    );
}

BlockQuoteRenderer.displayName = 'BlockQuoteRenderer';

export default BlockQuoteRenderer;
