import React from 'react';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

function StrongRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();
    const isChildOfTaskTitle = HTMLEngineUtils.isChildOfTaskTitle(tnode);

    return 'data' in tnode ? (
        <Text style={[styles.webViewStyles.baseFontStyle, styles.strong, isChildOfTaskTitle && styles.taskTitleMenuItem]}>{tnode.data}</Text>
    ) : (
        <TNodeChildrenRenderer
            tnode={tnode}
            renderChild={(props) => {
                return (
                    <Text
                        style={[styles.webViewStyles.baseFontStyle, styles.strong, isChildOfTaskTitle && styles.taskTitleMenuItem]}
                        key={props.key}
                    >
                        {props.childElement}
                    </Text>
                );
            }}
        />
    );
}

StrongRenderer.displayName = 'StrongRenderer';

export default StrongRenderer;
