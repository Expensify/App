import React from 'react';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

function BlockQuoteRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();
    const isChildOfTaskTitle = HTMLEngineUtils.isChildOfTaskTitle(tnode);

    return 'data' in tnode ? (
        <Text style={[styles.webViewStyles.baseFontStyle, !isChildOfTaskTitle && styles.webViewStyles.tagStyles.blockquote]}>{tnode.data}</Text>
    ) : (
        <TNodeChildrenRenderer
            tnode={tnode}
            renderChild={(props) => {
                return (
                    <Text
                        style={[styles.webViewStyles.baseFontStyle, !isChildOfTaskTitle && styles.blockquote]}
                        key={props.key}
                    >
                        {props.childElement}
                    </Text>
                );
            }}
        />
    );
}

BlockQuoteRenderer.displayName = 'BlockQuoteRenderer';

export default BlockQuoteRenderer;
