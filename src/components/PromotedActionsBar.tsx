import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getPinMenuItem, getShareMenuItem} from '@libs/HeaderUtils';
import Navigation from '@libs/Navigation/Navigation';
import {joinRoom, navigateToAndOpenReport, navigateToAndOpenReportWithAccountIDs} from '@userActions/Report';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type OnyxReport from '@src/types/onyx/Report';
import Button from './Button';
import type {ThreeDotsMenuItem} from './HeaderWithBackButton/types';
import * as Expensicons from './Icon/Expensicons';

type PromotedAction = {
    key: string;
} & ThreeDotsMenuItem;

type BasePromotedActions = typeof CONST.PROMOTED_ACTIONS.PIN | typeof CONST.PROMOTED_ACTIONS.JOIN;

type PromotedActionsType = Record<BasePromotedActions, (report: OnyxReport) => PromotedAction> & {
    [CONST.PROMOTED_ACTIONS.SHARE]: (report: OnyxReport, backTo?: string) => PromotedAction;
} & {
    [CONST.PROMOTED_ACTIONS.MESSAGE]: (params: {reportID?: string; accountID?: number; login?: string}) => PromotedAction;
};

const PromotedActions = {
    pin: (report) => ({
        key: CONST.PROMOTED_ACTIONS.PIN,
        ...getPinMenuItem(report),
    }),
    share: (report, backTo) => ({
        key: CONST.PROMOTED_ACTIONS.SHARE,
        ...getShareMenuItem(report, backTo),
    }),
    join: (report) => ({
        key: CONST.PROMOTED_ACTIONS.JOIN,
        icon: Expensicons.ChatBubbles,
        translationKey: 'common.join',
        onSelected: callFunctionIfActionIsAllowed(() => {
            Navigation.dismissModal();
            joinRoom(report);
        }),
    }),
    message: ({reportID, accountID, login}) => ({
        key: CONST.PROMOTED_ACTIONS.MESSAGE,
        icon: Expensicons.CommentBubbles,
        translationKey: 'common.message',
        onSelected: () => {
            if (reportID) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
                return;
            }

            // The accountID might be optimistic, so we should use the login if we have it
            if (login) {
                navigateToAndOpenReport([login], false);
                return;
            }
            if (accountID) {
                navigateToAndOpenReportWithAccountIDs([accountID]);
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
    const {translate} = useLocalize();

    if (promotedActions.length === 0) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.ph5, styles.mb5, styles.gap2, styles.mw100, styles.w100, styles.justifyContentCenter, containerStyle]}>
            {promotedActions.map(({key, onSelected, translationKey, ...props}) => (
                <View
                    style={[styles.flex1, styles.mw50]}
                    key={key}
                >
                    <Button
                        onPress={onSelected}
                        iconFill={theme.icon}
                        text={translate(translationKey)}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                    />
                </View>
            ))}
        </View>
    );
}

export default PromotedActionsBar;

export {PromotedActions};
export type {PromotedAction, PromotedActionsBarProps};
