import React from 'react';
import {View} from 'react-native';
import * as Report from '@userActions/Report';
import useLocalize from '@hooks/useLocalize';
import type { Report as OnyxReportType } from '@src/types/onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Button from './Button';
import * as Expensicons from './Icon/Expensicons';

type ChatActionsBarProps = {
    report: OnyxReportType;
};

function ChatActionsBar({report}: ChatActionsBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isPinned = !!report.isPinned;
    return (
        <View style={[styles.flexRow, styles.ph3, styles.mb5]}>
            <View style={[styles.flex1, styles.ph1]}>
                <Button
                    onPress={() => Report.leaveGroupChat(report.reportID)}
                    icon={Expensicons.Exit}
                    style={styles.flex1}
                    text={translate('common.leave')}
                />
            </View>
            <View style={{flex: 1, paddingHorizontal: 6}}>
                <Button
                    onPress={() => Report.togglePinnedState(report.reportID, isPinned)}
                    icon={Expensicons.Pin}
                    style={styles.flex1}
                    text={isPinned ? translate('common.unPin') : translate('common.pin')}
                />
            </View>
        </View>
    );
}

ChatActionsBar.displayName = 'ChatActionsBar';

export default ChatActionsBar;
