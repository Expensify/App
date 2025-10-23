import {useRoute} from '@react-navigation/native';
import React from 'react';
import type {ColorValue, StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import useHover from '@hooks/useHover';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import Navigation from '@libs/Navigation/Navigation';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {getReportAction, shouldReportActionBeVisible} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction as canUserPerformWriteActionReportUtils} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {ParentNavigationSummaryParams} from '@src/languages/params';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import Text from './Text';
import TextLink from './TextLink';

type ParentNavigationSubtitleProps = {
    parentNavigationSubtitleData: ParentNavigationSummaryParams;

    /** parent Report ID */
    parentReportID?: string;

    /** parent Report Action ID */
    parentReportActionID?: string;

    /** PressableWithoutFeedback additional styles */
    pressableStyles?: StyleProp<TextStyle>;

    /** Whether to open the parent report link in the current tab if possible */
    openParentReportInCurrentTab?: boolean;

    /** The status text of the expense report */
    statusText?: string;

    /** The background color for the status text */
    statusTextBackgroundColor?: ColorValue;

    /** The text color for the status text */
    statusTextColor?: ColorValue;
};

function ParentNavigationSubtitle({
    parentNavigationSubtitleData,
    parentReportActionID,
    parentReportID = '',
    pressableStyles,
    openParentReportInCurrentTab = false,
    statusText,
    statusTextBackgroundColor,
    statusTextColor,
}: ParentNavigationSubtitleProps) {
    const currentRoute = useRoute();
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {
        hovered,
        bind: {onMouseEnter, onMouseLeave},
    } = useHover();

    const {workspaceName, reportName} = parentNavigationSubtitleData;
    const {translate} = useLocalize();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, {canBeMissing: false});
    const isReportArchived = useReportIsArchived(report?.reportID);
    const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(report, isReportArchived);
    const isReportInRHP = currentRoute.name === SCREENS.SEARCH.REPORT_RHP;
    const currentFullScreenRoute = useRootNavigationState((state) => state?.routes?.findLast((route) => isFullScreenName(route.name)));

    // We should not display the parent navigation subtitle if the user does not have access to the parent chat (the reportName is empty in this case)
    if (!reportName) {
        return;
    }

    const onPress = () => {
        const parentAction = getReportAction(parentReportID, parentReportActionID);
        const isVisibleAction = shouldReportActionBeVisible(parentAction, parentAction?.reportActionID ?? CONST.DEFAULT_NUMBER_ID, canUserPerformWriteAction);

        if (openParentReportInCurrentTab && isReportInRHP) {
            // If the report is displayed in RHP in Reports tab, we want to stay in the current tab after opening the parent report
            if (currentFullScreenRoute?.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR) {
                const lastRoute = currentFullScreenRoute?.state?.routes.at(-1);
                if (lastRoute?.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT) {
                    const moneyRequestReportID = (lastRoute?.params as SearchFullscreenNavigatorParamList[typeof SCREENS.SEARCH.MONEY_REQUEST_REPORT])?.reportID;
                    // If the parent report is already displayed underneath RHP, simply dismiss the modal
                    if (moneyRequestReportID === parentReportID) {
                        Navigation.dismissModal();
                        return;
                    }
                }

                Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: parentReportID}));
                return;
            }

            // If the parent report is already displayed underneath RHP, simply dismiss the modal
            if (Navigation.getTopmostReportId() === parentReportID) {
                Navigation.dismissModal();
                return;
            }
        }

        if (isVisibleAction) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(parentReportID, parentReportActionID));
        } else {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(parentReportID));
        }
    };

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            {!!statusText && (
                <View
                    style={[
                        styles.reportStatusContainer,
                        styles.mr1,
                        {
                            backgroundColor: statusTextBackgroundColor,
                        },
                    ]}
                >
                    <Text style={[styles.reportStatusText, {color: statusTextColor}]}>{statusText}</Text>
                </View>
            )}
            <Text
                style={[styles.optionAlternateText, styles.textLabelSupporting, styles.flex1]}
                numberOfLines={1}
            >
                {!!reportName && (
                    <>
                        <Text style={[styles.optionAlternateText, styles.textLabelSupporting]}>{`${translate('threads.from')} `}</Text>
                        <TextLink
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                            onPress={onPress}
                            accessibilityLabel={translate('threads.parentNavigationSummary', {reportName, workspaceName})}
                            style={[pressableStyles, styles.optionAlternateText, styles.textLabelSupporting, hovered ? StyleUtils.getColorStyle(theme.linkHover) : styles.link]}
                        >
                            {reportName}
                        </TextLink>
                    </>
                )}
                {!!workspaceName && workspaceName !== reportName && (
                    <Text style={[styles.optionAlternateText, styles.textLabelSupporting]}>{` ${translate('threads.in')} ${workspaceName}`}</Text>
                )}
            </Text>
        </View>
    );
}

ParentNavigationSubtitle.displayName = 'ParentNavigationSubtitle';
export default ParentNavigationSubtitle;
