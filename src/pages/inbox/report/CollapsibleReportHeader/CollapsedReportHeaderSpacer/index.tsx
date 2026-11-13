import {isMobilePhoneWeb} from '@libs/isInLandscapeMode';

import {useActionListContext} from '@pages/inbox/ActionListContext';

import type {ViewStyle} from 'react-native';

import React from 'react';
import Reanimated, {useAnimatedStyle} from 'react-native-reanimated';

/**
 * Pads the oldest end of a report list by the space the collapsed header gave up, so the header slides in over it.
 * Disable FlashList's maintainVisibleContentPosition and Chrome's scroll anchoring (overflow-anchor) on a non-inverted
 * list, both scroll the padding back out of view.
 */
function MobileWebCollapsedReportHeaderSpacer() {
    const {collapsedHeaderHeightSV} = useActionListContext();
    const style = useAnimatedStyle<ViewStyle>(() => ({height: collapsedHeaderHeightSV.get()}));

    return <Reanimated.View style={style} />;
}

/** Only a phone browser ever collapses the report header on scroll, see CollapsibleReportHeader. */
function CollapsedReportHeaderSpacer() {
    if (!isMobilePhoneWeb) {
        return null;
    }

    return <MobileWebCollapsedReportHeaderSpacer />;
}

export default CollapsedReportHeaderSpacer;
