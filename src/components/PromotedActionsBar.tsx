import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as HeaderUtils from '@libs/HeaderUtils';
import * as Localize from '@libs/Localize';
import * as ReportActions from '@userActions/Report';
import type OnyxReport from '@src/types/onyx/Report';
import Button from './Button';
import type {ThreeDotsMenuItem} from './HeaderWithBackButton/types';
import * as Expensicons from './Icon/Expensicons';

type PromotedAction = {
    key: string;
} & ThreeDotsMenuItem;

type PromotedActionsType = Record<'pin' | 'share', (report: OnyxReport) => PromotedAction> & {
    message: (accountID: number) => PromotedAction;
};

const PromotedActions = {
    pin: (report) => ({
        key: 'pin',
        ...HeaderUtils.getPinMenuItem(report),
    }),
    share: (report) => ({
        key: 'share',
        ...HeaderUtils.getShareMenuItem(report),
    }),
    message: (accountID) => ({
        key: 'message',
        icon: Expensicons.CommentBubbles,
        text: Localize.translateLocal('common.message'),
        onSelected: () => ReportActions.navigateToAndOpenReportWithAccountIDs([accountID]),
    }),
} satisfies PromotedActionsType;

type PromotedActionsBarProps = {
    /** The list of actions to show */
    promotedActions: PromotedAction[];

    /** The style of the container */
    containerStyle?: StyleProp<ViewStyle>;
};

function PromotedActionsBar({promotedActions, containerStyle}: PromotedActionsBarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    if (promotedActions.length === 0) {
        return null;
    }

    if (promotedActions.length === 0) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.ph5, styles.mb5, styles.gap2, styles.mw100, styles.w100, styles.justifyContentCenter, containerStyle]}>
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
