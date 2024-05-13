import React, {useState} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Report from '@userActions/Report';
import type {Report as OnyxReportType} from '@src/types/onyx';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import * as Expensicons from './Icon/Expensicons';

type ChatDetailsQuickActionsBarProps = {
    report: OnyxReportType;
};

function ChatDetailsQuickActionsBar({report}: ChatDetailsQuickActionsBarProps) {
    const styles = useThemeStyles();
    const [isLastMemberLeavingGroupModalVisible, setIsLastMemberLeavingGroupModalVisible] = useState(false);
    const {translate} = useLocalize();
    const isPinned = !!report.isPinned;
    return (
        <View style={[styles.flexRow, styles.ph5, styles.mb5]}>
            <View style={[styles.flex1, styles.pr3]}>
                <ConfirmModal
                    danger
                    title={translate('groupChat.lastMemberTitle')}
                    isVisible={isLastMemberLeavingGroupModalVisible}
                    onConfirm={() => {
                        setIsLastMemberLeavingGroupModalVisible(false);
                        Report.leaveGroupChat(report.reportID);
                    }}
                    onCancel={() => setIsLastMemberLeavingGroupModalVisible(false)}
                    prompt={translate('groupChat.lastMemberWarning')}
                    confirmText={translate('common.leave')}
                    cancelText={translate('common.cancel')}
                />
                <Button
                    onPress={() => {
                        if (Object.keys(report?.participants ?? {}).length === 1) {
                            setIsLastMemberLeavingGroupModalVisible(true);
                            return;
                        }

                        Report.leaveGroupChat(report.reportID);
                    }}
                    icon={Expensicons.Exit}
                    style={styles.flex1}
                    text={translate('common.leave')}
                />
            </View>
            <View style={[styles.flex1]}>
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

ChatDetailsQuickActionsBar.displayName = 'ChatDetailsQuickActionsBar';

export default ChatDetailsQuickActionsBar;
