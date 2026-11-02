import type {OptionRowLHNProps} from '@components/LHNOptionsList/types';

import useThemeStyles from '@hooks/useThemeStyles';

import {shouldShowMarkAsDone} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet, View} from 'react-native';

import OptionRowLHN from './OptionRowLHN';

/** Kept apart from `OptionRowLHNData` because React Compiler does not memoize `getOptionData` when it is called there. */
type OptionRowLHNContentProps = Pick<OptionRowLHNProps, 'onSelectRow' | 'onLayout' | 'testID' | 'hasDraftComment'> & {
    optionDataParams: Parameters<typeof SidebarUtils.getOptionData>[0];

    /** Whether focus is enabled for the row and its report is the open one. An empty focused row renders nothing instead of a placeholder. */
    isReportFocused: boolean;

    viewMode: NonNullable<OptionRowLHNProps['viewMode']>;

    isIOUReport: boolean;

    /** The single sender of an IOU report, used to trim the row's avatars to match the report header */
    reportPreviewSenderID: number | undefined;
};

function OptionRowLHNContent({optionDataParams, isReportFocused, viewMode, isIOUReport, reportPreviewSenderID, hasDraftComment, ...propsToForward}: OptionRowLHNContentProps) {
    const styles = useThemeStyles();

    const optionItem = SidebarUtils.getOptionData(optionDataParams);

    // For single-sender IOUs, trim to the sender's avatar to match the header.
    // The header uses reportPreviewSenderID as accountID for its primary avatar,
    // so we pick the matching icon from getIconsForIOUReport to stay consistent.
    let finalOptionItem = optionItem;
    if (optionItem && isIOUReport && reportPreviewSenderID !== undefined && optionItem.icons && optionItem.icons.length > 1) {
        const senderIcon = optionItem.icons.find((icon) => Number(icon.id) === reportPreviewSenderID);
        finalOptionItem = {...optionItem, icons: [senderIcon ?? optionItem.icons.at(0)].filter((icon): icon is Icon => !!icon)};
    }

    const isInFocusMode = viewMode === CONST.OPTION_MODE.COMPACT;
    const placeholderRowStyle = StyleSheet.flatten<ViewStyle>(
        isInFocusMode
            ? [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRowCompact, styles.justifyContentCenter]
            : [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRow, styles.justifyContentCenter],
    );

    // rendering null as a render item causes the FlashList to render all
    // its children and consume significant memory on the first render. We can avoid this by
    // rendering a placeholder view instead. This behaviour is only observed when we
    // first sign in to the App.
    // For the focused-but-null case (e.g. submit an expense in offline mode and click on the
    // generated expense report), we render null so we only see the Report Details but no item in LHN.
    if (!finalOptionItem) {
        return isReportFocused ? null : <View style={placeholderRowStyle} />;
    }

    const shouldShowMarkAsDoneCopy =
        shouldShowMarkAsDone({
            report: optionDataParams.report,
            isTrackIntentUser: optionDataParams.isTrackIntentUser,
            policy: optionDataParams.policy,
            rules: optionDataParams.rules,
        }) && finalOptionItem?.actionBadge === CONST.REPORT.ACTION_BADGE.SUBMIT;

    return (
        <OptionRowLHN
            {...propsToForward}
            viewMode={viewMode}
            isOptionFocused={isReportFocused}
            optionItem={finalOptionItem}
            hasDraftComment={hasDraftComment}
            shouldShowMarkAsDoneCopy={shouldShowMarkAsDoneCopy}
        />
    );
}

OptionRowLHNContent.displayName = 'OptionRowLHNContent';

export default OptionRowLHNContent;
