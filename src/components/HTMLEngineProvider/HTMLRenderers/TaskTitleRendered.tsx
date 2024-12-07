import React from 'react';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

function TaskTitleRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();

    return (
        <Text style={[styles.taskTitleMenuItem]}>
            <TNodeChildrenRenderer tnode={tnode} />
        </Text>
    );
}

TaskTitleRenderer.displayName = 'TaskTitleRenderer';

export default TaskTitleRenderer;
