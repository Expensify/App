import React, {useContext} from 'react';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import ClickableContext from '@components/ClickableContext';
import TextLink from '@components/TextLink';
import useThemeStyles from '@hooks/useThemeStyles';

type ClickableRendererProps = CustomRendererProps<TText | TPhrasing>;

/**
 * Renders <clickable> tags inside HTML text to trigger a function.
 */
function ClickableRenderer({tnode}: ClickableRendererProps) {
    const styles = useThemeStyles();
    const clickableActions = useContext(ClickableContext);
    const id = tnode.attributes.id;

    const onPress = () => {
        const action = clickableActions?.[id];

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
