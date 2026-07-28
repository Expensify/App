import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnterKeyHandler from '@hooks/useEnterKeyHandler';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {navigateToConciergeChat as navigateToConciergeChatAction} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {StyleProp, TextStyle} from 'react-native';
import type {CustomRendererProps, RenderersProps, TPhrasing, TText} from 'react-native-render-html';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import {TNodeChildrenRenderer, useRendererProps} from 'react-native-render-html';

type ConciergeLinkRendererProps = CustomRendererProps<TText | TPhrasing>;

type ConciergeLinkRendererConfig = {
    onPress?: () => void;
};

type ConciergeLinkRenderersProps = RenderersProps & {
    // Custom HTML renderer keys must use hyphenated tag names per react-native-render-html API
    /* eslint-disable @typescript-eslint/naming-convention */
    'concierge-link': ConciergeLinkRendererConfig;
};

function ConciergeLinkRenderer({tnode, style}: ConciergeLinkRendererProps) {
    const styles = useThemeStyles();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {onPress: onPressFromProps} = useRendererProps<ConciergeLinkRenderersProps, 'concierge-link'>('concierge-link') ?? {};

    /**
     * Simple wrapper to create a stable reference without passing event args to navigation function.
     */
    const navigateToConciergeChat = () => {
        onPressFromProps?.();
        navigateToConciergeChatAction(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas, false);
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

    const handleKeyDown = useEnterKeyHandler(navigateToConciergeChat);

    return (
        <Text
            style={[style as TextStyle, linkStyle]}
            onPress={navigateToConciergeChat}
            onKeyDown={handleKeyDown}
            suppressHighlighting
            accessible
            role={CONST.ROLE.LINK}
            tabIndex={0}
        >
            <TNodeChildrenRenderer tnode={tnode} />
        </Text>
    );
}

export default ConciergeLinkRenderer;
