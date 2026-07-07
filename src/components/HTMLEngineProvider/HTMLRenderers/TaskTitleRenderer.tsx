import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';

import React from 'react';
import {TNodeChildrenRenderer} from 'react-native-render-html';

function TaskTitleRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();

    return (
        <TNodeChildrenRenderer
            tnode={tnode}
            renderChild={(props) => {
                return (
                    <Text
                        style={[styles.taskTitleMenuItem]}
                        key={props.key}
                    >
                        {props.childElement}
                    </Text>
                );
            }}
        />
    );
}

export default TaskTitleRenderer;
