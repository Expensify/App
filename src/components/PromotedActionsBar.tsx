import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as HeaderUtils from '@libs/HeaderUtils';
import * as Session from '@userActions/Session';
import * as Localize from '@libs/Localize';
import * as ReportActions from '@userActions/Report';
import type OnyxReport from '@src/types/onyx/Report';
import Button from './Button';
import type {ThreeDotsMenuItem} from './HeaderWithBackButton/types';
import * as Expensicons from './Icon/Expensicons';

type PromotedAction = {
    key: string;
} & ThreeDotsMenuItem;

type PromotedActionsType = Record<'pin' | 'share' | 'join', (report: OnyxReport) => PromotedAction> & {
    message: (params: {accountID?: number; login?: string}) => PromotedAction;
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
    join: (report) => ({
        key: 'join',
        icon: Expensicons.ChatBubbles,
        text: Localize.translateLocal('common.join'),
        onSelected: () => {
            Session.checkIfActionIsAllowed(() => ReportActions.joinRoom(report));
        }
    }),
    message: ({accountID, login}) => ({
        key: 'message',
        icon: Expensicons.CommentBubbles,
        text: Localize.translateLocal('common.message'),
        onSelected: () => {
            // The accountID might be optimistic, so we should use the login if we have it
            if (login) {
                ReportActions.navigateToAndOpenReport([login]);
                return;
            }
            if (accountID) {
                ReportActions.navigateToAndOpenReportWithAccountIDs([accountID]);
            }
        },
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
