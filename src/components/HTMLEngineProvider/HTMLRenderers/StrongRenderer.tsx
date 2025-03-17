import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import useThemeStyles from '@hooks/useThemeStyles';

function StrongRenderer({tnode, TDefaultRenderer, style, ...props}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();
    const isChildOfTaskTitle = HTMLEngineUtils.isChildOfTaskTitle(tnode);

    return (
        <TDefaultRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            tnode={tnode}
            style={[style as StyleProp<TextStyle>, isChildOfTaskTitle && styles.taskTitleMenuItem, {fontStyle: (style.fontStyle as TextStyle['fontStyle']) ?? 'normal'}]}
        />
    );
}

StrongRenderer.displayName = 'StrongRenderer';

export default StrongRenderer;
