import React from 'react';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import TextLink from '@components/TextLink';
import useThemeStyles from '@hooks/useThemeStyles';
import ClickableActionsUtils from '@libs/HTMLClickableActionsUtils';

type ClickableRendererProps = CustomRendererProps<TText | TPhrasing>;

/**
 * Renders <clickable> tags inside HTML text and triggers the corresponding action.
 */
function ClickableRenderer({tnode}: ClickableRendererProps) {
    const styles = useThemeStyles();
    const id = tnode.attributes.id;

    const onPress = () => {
        const action = ClickableActionsUtils[id];

        if (action) {
            action();
        }
    };

    return (
        <TextLink
            onPress={onPress}
            style={[styles.textLabel, styles.link]}
        >
            <TNodeChildrenRenderer tnode={tnode} />
        </TextLink>
    );
}

ClickableRenderer.displayName = 'ClickableRenderer';

export default ClickableRenderer;
