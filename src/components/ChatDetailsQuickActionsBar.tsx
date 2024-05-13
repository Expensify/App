import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
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
    key: string;
    icon: IconAsset;
    text: string;
    onPress: () => void;
};

type QuickActionsParams = {
    report: OnyxReportType;
};

function useQuickActions({report}: QuickActionsParams): Record<string, QuickAction> {
    const {translate} = useLocalize();
    const onPinButtonPress = useCallback(() => Report.togglePinnedState(report.reportID, !!report.isPinned), [report.isPinned, report.reportID]);
    const onShareButtonPress = useCallback(() => Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS_SHARE_CODE.getRoute(report?.reportID ?? '')), [report?.reportID]);

    return useMemo(
        () => ({
            pin: {
                key: 'pin',
                icon: Expensicons.Pin,
                text: report.isPinned ? translate('common.unPin') : translate('common.pin'),
                onPress: onPinButtonPress,
            },
            join: {
                key: 'join',
                icon: Expensicons.Pin,
                text: translate('common.join'),
                onPress: () => {
                    console.log('todo: join');
                },
            },
            share: {
                key: 'share',
                icon: Expensicons.QrCode,
                text: translate('common.share'),
                onPress: onShareButtonPress,
            },
            hold: {
                key: 'hold',
                icon: Expensicons.Pin,
                text: translate('iou.hold'),
                onPress: () => {
                    console.log('todo: hold');
                },
            },
        }),
        [report.isPinned, translate, onPinButtonPress, onShareButtonPress],
    );
}

type ChatDetailsQuickActionsBarProps = {
    report: OnyxReportType;

    actionButtons: QuickAction[];

    /**
     * Whether to show the `Leave` button.
     * @deprecated Remove this prop when @src/pages/ReportDetailsPage.tsx is updated
     */
    shouldShowLeaveButton: boolean;
};

function ChatDetailsQuickActionsBar({report, actionButtons, shouldShowLeaveButton}: ChatDetailsQuickActionsBarProps) {
    const styles = useThemeStyles();
    const [isLastMemberLeavingGroupModalVisible, setIsLastMemberLeavingGroupModalVisible] = useState(false);
    const {translate} = useLocalize();

    return (
        <View style={[styles.flexRow, styles.ph5, styles.mb5, styles.gap3]}>
            {actionButtons.map(({key, ...props}) => (
                <View style={[styles.flex1]}>
                    <Button
                        key={key}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                    />
                </View>
            ))}
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
        </View>
    );
}

ChatDetailsQuickActionsBar.displayName = 'ChatDetailsQuickActionsBar';

export default ChatDetailsQuickActionsBar;

export {useQuickActions};
