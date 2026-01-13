import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import Text from '@components/Text';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateToConciergeChat as navigateToConciergeChatAction} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';

type ConciergeLinkRendererProps = CustomRendererProps<TText | TPhrasing>;

function ConciergeLinkRenderer({tnode, style}: ConciergeLinkRendererProps) {
    const styles = useThemeStyles();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});

    /**
     * Simple wrapper to create a stable reference without passing event args to navigation function.
     */
    const navigateToConciergeChat = () => {
        navigateToConciergeChatAction(conciergeReportID, false);
    };

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

export default ConciergeLinkRenderer;
