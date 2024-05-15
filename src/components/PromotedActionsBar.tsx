import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as HeaderUtils from '@libs/HeaderUtils';
import * as Report from '@userActions/Report';
import type {Report as OnyxReportType} from '@src/types/onyx';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import type {ThreeDotsMenuItem} from './HeaderWithBackButton/types';
import * as Expensicons from './Icon/Expensicons';

type PromotedAction = {
    key: string;
} & ThreeDotsMenuItem;

type PromotedActionsParams = {
    report: OnyxReportType;
};

function usePromotedActions({report}: PromotedActionsParams): Record<string, PromotedAction> {
    // const {translate} = useLocalize();
    // const join = Session.checkIfActionIsAllowed(() => Report.joinRoom(report));
    // const onShareButtonPress = useCallback(() => Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS_SHARE_CODE.getRoute(report?.reportID ?? '')), [report?.reportID]);

    return useMemo(
        () => ({
            pin: {
                key: 'pin',
                ...HeaderUtils.getPinMenuItem(report),
            },
            // join: {
            //     key: 'join',
            //     icon: Expensicons.CommentBubbles,
            //     text: translate('common.join'),
            //     onSelected: join,
            // },
            // TODO: Uncomment and test it when needed
            // share: {
            //     key: 'share',
            //     icon: Expensicons.QrCode,
            //     text: translate('common.share'),
            //     onSelected: onShareButtonPress,
            // },
            // hold: {
            //     key: 'hold',
            //     icon: Expensicons.Stopwatch,
            //     text: translate('iou.hold'),
            //     onSelected: () => {
            //         // TODO: Implement this
            //     },
            // },
        }),
        [report],
    );
}

type PromotedActionsBarProps = {
    /** The report of actions */
    report: OnyxReportType;

    /** The list of actions to show */
    promotedActions: PromotedAction[];

    /**
     * Whether to show the `Leave` button.
     * @deprecated Remove this prop when @src/pages/ReportDetailsPage.tsx is updated
     */
    shouldShowLeaveButton?: boolean;
};

function PromotedActionsBar({report, promotedActions, shouldShowLeaveButton}: PromotedActionsBarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [isLastMemberLeavingGroupModalVisible, setIsLastMemberLeavingGroupModalVisible] = useState(false);
    const {translate} = useLocalize();

    return (
        <View style={[styles.flexRow, styles.ph5, styles.mb5, styles.gap2]}>
            {/* TODO: Remove the `Leave` button when @src/pages/ReportDetailsPage.tsx is updated */}
            {shouldShowLeaveButton && (
                // The `Leave` button is left to make the component backward compatible with the existing code.
                // After the `Leave` button is moved to the `MenuItem` list, this block can be removed.
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
                        medium
                        text={translate('common.leave')}
                    />
                </View>
            )}
            {promotedActions.map(({key, onSelected, ...props}) => (
                <View
                    style={[styles.flex1]}
                    key={key}
                >
                    <Button
                        onPress={onSelected}
                        iconFill={theme.icon}
                        medium
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                    />
                </View>
            ))}
        </View>
    );
}

PromotedActionsBar.displayName = 'PromotedActionsBar';

export default PromotedActionsBar;

export {usePromotedActions};
export type {PromotedActionsBarProps, PromotedAction};
