import {useRoute} from '@react-navigation/native';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useRootNavigationState from '@hooks/useRootNavigationState';
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
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Text from './Text';

type ParentNavigationSubtitleProps = {
    parentNavigationSubtitleData: ParentNavigationSummaryParams;

    /** parent Report ID */
    parentReportID?: string;

    /** parent Report Action ID */
    parentReportActionID?: string;

    /** PressableWithoutFeedback additional styles */
    pressableStyles?: StyleProp<ViewStyle>;

    /** Whether to open the parent report link in the current tab if possible */
    openParentReportInCurrentTab?: boolean;
};

function ParentNavigationSubtitle({
    parentNavigationSubtitleData,
    parentReportActionID,
    parentReportID = '',
    pressableStyles,
    openParentReportInCurrentTab = false,
}: ParentNavigationSubtitleProps) {
    const currentRoute = useRoute();
    const styles = useThemeStyles();
    const {workspaceName, reportName} = parentNavigationSubtitleData;
    const {translate} = useLocalize();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, {canBeMissing: false});
    const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(report);
    const isReportInRHP = currentRoute.name === SCREENS.SEARCH.REPORT_RHP;
    const currentFullScreenRoute = useRootNavigationState((state) => state?.routes?.findLast((route) => isFullScreenName(route.name)));

    // We should not display the parent navigation subtitle if the user does not have access to the parent chat (the reportName is empty in this case)
    if (!reportName) {
        return;
    }

    return (
        <PressableWithoutFeedback
            onPress={() => {
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
            }}
            accessibilityLabel={translate('threads.parentNavigationSummary', {reportName, workspaceName})}
            role={CONST.ROLE.LINK}
            style={pressableStyles}
        >
            <Text
                style={[styles.optionAlternateText, styles.textLabelSupporting]}
                numberOfLines={1}
            >
                {!!reportName && (
                    <>
                        <Text style={[styles.optionAlternateText, styles.textLabelSupporting]}>{`${translate('threads.from')} `}</Text>
                        <Text style={[styles.optionAlternateText, styles.textLabelSupporting, styles.link]}>{reportName}</Text>
                    </>
                )}
                {!!workspaceName && workspaceName !== reportName && (
                    <Text style={[styles.optionAlternateText, styles.textLabelSupporting]}>{` ${translate('threads.in')} ${workspaceName}`}</Text>
                )}
            </Text>
        </PressableWithoutFeedback>
    );
}

ParentNavigationSubtitle.displayName = 'ParentNavigationSubtitle';
export default ParentNavigationSubtitle;
