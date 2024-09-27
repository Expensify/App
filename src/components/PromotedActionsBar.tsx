import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as HeaderUtils from '@libs/HeaderUtils';
import * as Localize from '@libs/Localize';
import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import * as ReportActions from '@userActions/Report';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {ReportAction} from '@src/types/onyx';
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
} & {
    [CONST.PROMOTED_ACTIONS.HOLD]: (params: {
        isTextHold: boolean;
        reportAction: ReportAction | undefined;
        reportID?: string;
        isDelegateAccessRestricted: boolean;
        setIsNoDelegateAccessMenuVisible: (isVisible: boolean) => void;
        currentSearchHash?: number;
    }) => PromotedAction;
};

const PromotedActions = {
    pin: (report) => ({
        key: CONST.PROMOTED_ACTIONS.PIN,
        ...HeaderUtils.getPinMenuItem(report),
    }),
    share: (report, backTo) => ({
        key: CONST.PROMOTED_ACTIONS.SHARE,
        ...HeaderUtils.getShareMenuItem(report, backTo),
    }),
    join: (report) => ({
        key: CONST.PROMOTED_ACTIONS.JOIN,
        icon: Expensicons.ChatBubbles,
        text: Localize.translateLocal('common.join'),
        onSelected: Session.checkIfActionIsAllowed(() => {
            Navigation.dismissModal();
            ReportActions.joinRoom(report);
        }),
    }),
    message: ({reportID, accountID, login}) => ({
        key: CONST.PROMOTED_ACTIONS.MESSAGE,
        icon: Expensicons.CommentBubbles,
        text: Localize.translateLocal('common.message'),
        onSelected: () => {
            if (reportID) {
                Navigation.dismissModal(reportID);
                return;
            }

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
    hold: ({isTextHold, reportAction, reportID, isDelegateAccessRestricted, setIsNoDelegateAccessMenuVisible, currentSearchHash}) => ({
        key: CONST.PROMOTED_ACTIONS.HOLD,
        icon: Expensicons.Stopwatch,
        text: Localize.translateLocal(`iou.${isTextHold ? 'hold' : 'unhold'}`),
        onSelected: () => {
            if (isDelegateAccessRestricted) {
                setIsNoDelegateAccessMenuVisible(true); // Show the menu
                return;
            }

            if (!isTextHold) {
                Navigation.goBack();
            }
            const targetedReportID = reportID ?? reportAction?.childReportID ?? '';
            const topmostCentralPaneRoute = getTopmostCentralPaneRoute(navigationRef.getRootState() as State<RootStackParamList>);

            if (topmostCentralPaneRoute?.name !== SCREENS.SEARCH.CENTRAL_PANE && isTextHold) {
                ReportUtils.changeMoneyRequestHoldStatus(reportAction, ROUTES.REPORT_WITH_ID.getRoute(targetedReportID));
                return;
            }

            ReportUtils.changeMoneyRequestHoldStatus(reportAction, ROUTES.SEARCH_REPORT.getRoute({reportID: targetedReportID}));
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
export type {PromotedAction, PromotedActionsBarProps};
