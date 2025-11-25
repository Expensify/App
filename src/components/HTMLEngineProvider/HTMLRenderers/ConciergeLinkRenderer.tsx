import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToConciergeChat as navigateToConciergeChatAction} from '@userActions/Report';

type ConciergeLinkRendererProps = CustomRendererProps<TText | TPhrasing>;

/**
 * Simple wrapper to create a stable reference without passing event args to navigation function.
 */
function navigateToConciergeChat() {
    navigateToConciergeChatAction();
}

function ConciergeLinkRenderer({tnode, style}: ConciergeLinkRendererProps) {
    const styles = useThemeStyles();

    // Define link style based on context
    let linkStyle: StyleProp<TextStyle> = styles.link;

    // Special handling for links in RBR to maintain consistent font size
    if (HTMLEngineUtils.isChildOfRBR(tnode)) {
        linkStyle = [
            styles.link,
            {
                fontSize: HTMLEngineUtils.getFontSizeOfRBRChild(tnode),
            },
        ];
    }

    return (
        <Text
            style={[style as TextStyle, linkStyle]}
            onPress={navigateToConciergeChat}
            suppressHighlighting
        >
            <TNodeChildrenRenderer tnode={tnode} />
        </Text>
    );
}

ConciergeLinkRenderer.displayName = 'ConciergeLinkRenderer';

export default ConciergeLinkRenderer;
