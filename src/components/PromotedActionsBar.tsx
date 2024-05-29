import React, {useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as HeaderUtils from '@libs/HeaderUtils';
import * as ReportActions from '@userActions/Report';
import type OnyxReport from '@src/types/onyx/Report';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import type {ThreeDotsMenuItem} from './HeaderWithBackButton/types';
import * as Expensicons from './Icon/Expensicons';

type PromotedAction = {
    key: string;
} & ThreeDotsMenuItem;

type ReportPromotedAction = (report: OnyxReport) => PromotedAction;

type PromotedActionsType = {
    pin: ReportPromotedAction;
};

const PromotedActions = {
    pin: (report) => ({
        key: 'pin',
        ...HeaderUtils.getPinMenuItem(report),
    }),
} satisfies PromotedActionsType;

type PromotedActionsBarProps = {
    /** The report of actions */
    report?: OnyxReport;

    /** The list of actions to show */
    promotedActions: PromotedAction[];

    /** The style of the container */
    containerStyle?: StyleProp<ViewStyle>;

    /**
     * Whether to show the `Leave` button.
     * @deprecated Remove this prop when @src/pages/ReportDetailsPage.tsx is updated
     */
    shouldShowLeaveButton?: boolean;
};

function PromotedActionsBar({report, promotedActions, containerStyle, shouldShowLeaveButton}: PromotedActionsBarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [isLastMemberLeavingGroupModalVisible, setIsLastMemberLeavingGroupModalVisible] = useState(false);
    const {translate} = useLocalize();

    if (promotedActions.length === 0) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.ph5, styles.mb5, styles.gap2, styles.mw100, styles.w100, styles.justifyContentCenter, containerStyle]}>
            {/* TODO: Remove the `Leave` button when @src/pages/ReportDetailsPage.tsx is updated */}
            {shouldShowLeaveButton && report && (
                // The `Leave` button is left to make the component backward compatible with the existing code.
                // After the `Leave` button is moved to the `MenuItem` list, this block can be removed.
                <View style={[styles.flex1]}>
                    <ConfirmModal
                        danger
                        title={translate('groupChat.lastMemberTitle')}
                        isVisible={isLastMemberLeavingGroupModalVisible}
                        onConfirm={() => {
                            setIsLastMemberLeavingGroupModalVisible(false);
                            ReportActions.leaveGroupChat(report.reportID);
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

                            ReportActions.leaveGroupChat(report.reportID);
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
                    style={[styles.flex1, styles.mw50]}
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

export {PromotedActions};
export type {PromotedActionsBarProps, PromotedAction};
