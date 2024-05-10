import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {satisfies} from 'semver';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as Report from '@userActions/Report';
import ROUTES from '@src/ROUTES';
import type {Report as OnyxReportType} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import * as Expensicons from './Icon/Expensicons';

type QuickAction = {
    icon: IconAsset;
    text: string;
    onPress: (report: OnyxReportType) => void;
};

type FunctionType = (report: OnyxReportType) => void;

type OnPressOrQuickAction = ((func: FunctionType) => QuickAction) | QuickAction;

const QuickActions = {
    leave: {
        icon: Expensicons.Exit,
        text: 'common.leave',
        onPress: () => {
            // Do something
        },
    },
    // ...
} satisfies Record<string, OnPressOrQuickAction>;

type ChatDetailsQuickActionsBarProps = {
    report: OnyxReportType;

    actionButtons: QuickAction[];
};

// <ChatDetailsQuickActionsBar actionButtons={[QuickActions.leave]} />

function ChatDetailsQuickActionsBar({report, actionButtons, shouldShowLeaveButton}: ChatDetailsQuickActionsBarProps) {
    const styles = useThemeStyles();
    const [isLastMemberLeavingGroupModalVisible, setIsLastMemberLeavingGroupModalVisible] = useState(false);
    const {translate} = useLocalize();
    const isPinned = !!report.isPinned;

    const onShareButtonPress = useCallback(() => Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS_SHARE_CODE.getRoute(report?.reportID ?? '')), [report?.reportID]);

    return (
        <View style={[styles.flexRow, styles.ph5, styles.mb5, styles.gap3]}>
            {/* TODO: Remove the `Leave` button when @src/pages/ReportDetailsPage.tsx is updated */}
            {shouldShowLeaveButton && (
                <View style={[styles.flex1]}>
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
            )}

            {shouldShowJoinButton && (
                <View style={[styles.flex1]}>
                    <Button
                        onPress={onJoinButtonPress}
                        icon={Expensicons.Pin}
                        style={styles.flex1}
                        text={translate('common.join')}
                    />
                </View>
            )}
            {shouldShowHoldButton && (
                <View style={[styles.flex1]}>
                    <Button
                        onPress={onHoldButtonPress}
                        icon={Expensicons.Pin}
                        style={styles.flex1}
                        text={translate('iou.hold')}
                    />
                </View>
            )}
            {shouldShowPinButton && (
                <View style={[styles.flex1]}>
                    <Button
                        onPress={() => Report.togglePinnedState(report.reportID, isPinned)}
                        icon={Expensicons.Pin}
                        style={styles.flex1}
                        text={isPinned ? translate('common.unPin') : translate('common.pin')}
                    />
                </View>
            )}
            {shouldShowShareButton && (
                <View style={[styles.flex1]}>
                    <Button
                        onPress={onShareButtonPress}
                        icon={Expensicons.QrCode}
                        style={styles.flex1}
                        text={translate('common.share')}
                    />
                </View>
            )}
        </View>
    );
}

ChatDetailsQuickActionsBar.displayName = 'ChatDetailsQuickActionsBar';

export default ChatDetailsQuickActionsBar;

export {QuickActions};
