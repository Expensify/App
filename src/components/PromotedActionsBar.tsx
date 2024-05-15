import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as HeaderUtils from '@libs/HeaderUtils';
import * as Localize from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type OnyxReport from '@src/types/onyx/Report';
import Button from './Button';
import type {ThreeDotsMenuItem} from './HeaderWithBackButton/types';
import * as Expensicons from './Icon/Expensicons';

type PromotedAction = {
    key: string;
} & ThreeDotsMenuItem;

type ReportPromotedAction = (report: OnyxReport) => PromotedAction;

type PromotedActionsType = {
    pin: ReportPromotedAction;
    share: ReportPromotedAction;
    // message: (accountID: number) => PromotedAction;
    // join: ReportPromotedAction;
    // hold: () => PromotedAction;
};

const PromotedActions = {
    pin: (report) => ({
        key: 'pin',
        ...HeaderUtils.getPinMenuItem(report),
    }),
    share: (report) => ({
        key: 'share',
        icon: Expensicons.QrCode,
        text: Localize.translateLocal('common.share'),
        onSelected: () => Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS_SHARE_CODE.getRoute(report?.reportID ?? '')),
    }),
    // TODO: Uncomment the following lines when the corresponding features are implemented
    // message: (accountID) => ({
    //     key: 'message',
    //     icon: Expensicons.CommentBubbles,
    //     text: Localize.translateLocal('common.message'),
    //     onSelected: () => ReportActions.navigateToAndOpenReportWithAccountIDs([accountID]),
    // }),
    // join: (report) => ({
    //     key: 'join',
    //     icon: Expensicons.CommentBubbles,
    //     text: Localize.translateLocal('common.join'),
    //     onSelected: () => Session.checkIfActionIsAllowed(() => Report.joinRoom(report)),
    // }),
    // hold: () => ({
    //     key: 'hold',
    //     icon: Expensicons.Stopwatch,
    //     text: Localize.translateLocal('iou.hold'),
    //     onSelected: () => {},
    // }),
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
        <View style={[styles.flexRow, styles.ph5, styles.mb5, styles.gap2, styles.mw100, styles.w100, containerStyle]}>
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

export {PromotedActions};
export type {PromotedActionsBarProps, PromotedAction};
