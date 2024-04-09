import React, {useState} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Report from '@userActions/Report';
import type {Report as OnyxReportType} from '@src/types/onyx';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import * as Expensicons from './Icon/Expensicons';

type ChatActionsBarProps = {
    report: OnyxReportType;
};

function ChatActionsBar({report}: ChatActionsBarProps) {
    const styles = useThemeStyles();
    const [isLastMemberLeavingGroupModalVisible, setIsLastMemberLeavingGroupModalVisible] = useState(false);
    const {translate} = useLocalize();
    const isPinned = !!report.isPinned;
    return (
        <View style={[styles.flexRow, styles.ph3, styles.mb5]}>
            <View style={[styles.flex1, styles.ph1]}>
                <ConfirmModal
                    danger
                    title={translate('common.leaveChat')}
                    isVisible={isLastMemberLeavingGroupModalVisible}
                    onConfirm={() => {
                        setIsLastMemberLeavingGroupModalVisible(false);
                        Report.leaveGroupChat(report.reportID);
                    }}
                    onCancel={() => setIsLastMemberLeavingGroupModalVisible(false)}
                    // TODO: Get this copy confirmed
                    prompt="Heads up! You are the last member of this group chat. Once you leave you will not be able to access the contents again."
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
            <View style={[styles.flex1, styles.ph3]}>
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
