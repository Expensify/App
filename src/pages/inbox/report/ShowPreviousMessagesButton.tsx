import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

type ShowPreviousMessagesButtonProps = {
    /** The ID of the report this list item belongs to */
    reportID: string;

    /** The action type of the report action being rendered for this list item */
    actionType: ReportAction['actionName'];

    /** Whether there are previous messages hidden before the session start */
    hasPreviousMessages: boolean;

    /** Whether the full message history is currently shown */
    showFullHistory: boolean;

    /** Callback to reveal the full message history */
    onPress?: () => void;
};

function ShowPreviousMessagesButton({reportID, actionType, hasPreviousMessages, showFullHistory, onPress}: ShowPreviousMessagesButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['UpArrow']);
    const isInSidePanel = useIsInSidePanel();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isConciergeSidePanel = isInSidePanel && reportID === conciergeReportID;

    if (!isConciergeSidePanel) {
        return null;
    }
    if (!onPress) {
        return null;
    }
    if (actionType !== CONST.REPORT.ACTIONS.TYPE.CREATED) {
        return null;
    }
    if (!hasPreviousMessages) {
        return null;
    }
    if (showFullHistory) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.pv3, styles.mh5]}>
            <View style={[styles.threadDividerLine, styles.ml0, styles.mr0, styles.flexGrow1]} />
            <View>
                <Button
                    small
                    shouldShowRightIcon
                    iconRight={expensifyIcons.UpArrow}
                    text={translate('common.concierge.showHistory')}
                    onPress={onPress}
                />
            </View>
            <View style={[styles.threadDividerLine, styles.ml0, styles.mr0, styles.flexGrow1]} />
        </View>
    );
}

export default ShowPreviousMessagesButton;
