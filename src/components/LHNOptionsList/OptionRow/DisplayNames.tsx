import React, {use} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import DisplayNames from '@components/DisplayNames';
import useIsArchived from '@hooks/useIsArchived';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {isHiddenForCurrentUser} from '@libs/OptionsListUtils';
import {getReportNotificationPreference, isChatRoom, isGroupChat, isInvoiceReport, isMoneyRequestReport, isPolicyExpenseChat, isSystemChat, isTaskReport, isThread} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import useDisplayNamesWithTooltips from './hooks/useDisplayNamesWithTooltips';
import useIsReportUnread from './hooks/useIsReportUnread';
import useOptionName from './hooks/useOptionName';
import {OptionRowContext} from './Provider';

const notificationPreferenceSelector = (report: OnyxEntry<Report>) => getReportNotificationPreference(report);

function OptionRowLHNDisplayNames() {
    const {
        state: {reportID, isFocused},
    } = use(OptionRowContext);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [notificationPreference] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true, selector: notificationPreferenceSelector});
    const isUnread = useIsReportUnread(reportID);
    const isArchived = useIsArchived(reportID);
    const textStyle = isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    const textUnreadStyle =
        isUnread && notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE && !isHiddenForCurrentUser(notificationPreference)
            ? [textStyle, styles.sidebarLinkTextBold]
            : [textStyle];
    const reportName = useOptionName(reportID);
    const displayNamesWithTooltips = useDisplayNamesWithTooltips(reportID);
    const displayNameStyle = [styles.optionDisplayName, styles.optionDisplayNameCompact, styles.pre, textUnreadStyle, styles.flexShrink0];
    const shouldUseFullTitle =
        isChatRoom(report) ||
        isPolicyExpenseChat(report) ||
        isTaskReport(report) ||
        isThread(report) ||
        isMoneyRequestReport(report) ||
        isInvoiceReport(report) ||
        isGroupChat(report) ||
        isSystemChat(report) ||
        isArchived;

    return (
        <DisplayNames
            accessibilityLabel={translate('accessibilityHints.chatUserDisplayNames')}
            fullTitle={reportName}
            displayNamesWithTooltips={displayNamesWithTooltips}
            tooltipEnabled
            numberOfLines={1}
            textStyles={displayNameStyle}
            shouldUseFullTitle={shouldUseFullTitle}
        />
    );
}

export default OptionRowLHNDisplayNames;
