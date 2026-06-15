import type {CustomRendererProps, TPhrasing, TText} from '@native-html/render';
import {TNodeChildrenRenderer} from '@native-html/render';
import React from 'react';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

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
