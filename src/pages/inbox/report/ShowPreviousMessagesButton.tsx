import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

type ShowPreviousMessagesButtonProps = {
    /** The report action being rendered for this list item */
    reportAction: ReportAction;

    /** Whether there are previous messages hidden before the session start */
    hasPreviousMessages: boolean;

    /** Whether the full message history is currently shown */
    showFullHistory: boolean;

    /** Callback to reveal the full message history */
    onPress: () => void;
};

function ShowPreviousMessagesButton({reportAction, hasPreviousMessages, showFullHistory, onPress}: ShowPreviousMessagesButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['UpArrow']);

    if (reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED) {
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
