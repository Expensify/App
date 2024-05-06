import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as Report from '@userActions/Report';
import ROUTES from '@src/ROUTES';
import type {Report as OnyxReportType} from '@src/types/onyx';
import Button from './Button';
import * as Expensicons from './Icon/Expensicons';

type ChatDetailsQuickActionsBarProps = {
    report: OnyxReportType;
};

function ChatDetailsQuickActionsBar({report}: ChatDetailsQuickActionsBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isPinned = !!report.isPinned;
    return (
        <View style={[styles.flexRow, styles.ph5, styles.mb5]}>
            <View style={[styles.flex1, styles.pr3]}>
                <Button
                    onPress={() => Report.togglePinnedState(report.reportID, isPinned)}
                    icon={Expensicons.Pin}
                    style={styles.flex1}
                    text={isPinned ? translate('common.unPin') : translate('common.pin')}
                />
            </View>
            <View style={[styles.flex1]}>
                <Button
                    onPress={() => {
                        Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS_SHARE_CODE.getRoute(report?.reportID ?? ''));
                    }}
                    icon={Expensicons.QrCode}
                    style={styles.flex1}
                    text={translate('common.share')}
                />
            </View>
        </View>
    );
}

ChatDetailsQuickActionsBar.displayName = 'ChatDetailsQuickActionsBar';

export default ChatDetailsQuickActionsBar;
