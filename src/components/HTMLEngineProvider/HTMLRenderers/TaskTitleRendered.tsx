import React from 'react';
import {View} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

function TaskTitleRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();

    return (
        <View style={[]}>
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
        </View>
    );
}

TaskTitleRenderer.displayName = 'TaskTitleRenderer';

export default TaskTitleRenderer;
