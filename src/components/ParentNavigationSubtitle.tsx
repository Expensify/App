import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {ParentNavigationSummaryParams} from '@src/languages/params';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Text from './Text';

type ParentNavigationSubtitleProps = {
    parentNavigationSubtitleData: ParentNavigationSummaryParams;

    /** parent Report ID */
    parentReportID?: string;

    /** parent Report Action ID */
    parentReportActionID?: string;

    /** PressableWithoutFeedack additional styles */
    pressableStyles?: StyleProp<ViewStyle>;
};

function ParentNavigationSubtitle({parentNavigationSubtitleData, parentReportActionID, parentReportID = '', pressableStyles}: ParentNavigationSubtitleProps) {
    const styles = useThemeStyles();
    const {workspaceName, reportName} = parentNavigationSubtitleData;
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`);
    const canUserPerformWriteAction = ReportUtils.canUserPerformWriteAction(report);

    // State to store last valid IDs
    const [cachedParentReportID, setCachedParentReportID] = useState(parentReportID);
    const [cachedParentReportActionID, setCachedParentReportActionID] = useState(parentReportActionID);

    // Cache valid IDs when they are available
    useEffect(() => {
        if (parentReportID) {
            setCachedParentReportID(parentReportID);
        }
        if (parentReportActionID) {
            setCachedParentReportActionID(parentReportActionID);
        }
    }, [parentReportID, parentReportActionID]);

    // Use cached IDs if the current ones are missing
    const finalParentReportID = parentReportID || cachedParentReportID;
    const finalParentReportActionID = parentReportActionID || cachedParentReportActionID;

    // We should not display the parent navigation subtitle if the user does not have access to the parent chat (the reportName is empty in this case)
    if (!reportName) {
        return null;
    }

    return (
        <PressableWithoutFeedback
            onPress={() => {
                const parentAction = ReportActionsUtils.getReportAction(finalParentReportID, finalParentReportActionID ?? '-1');
                const isVisibleAction = ReportActionsUtils.shouldReportActionBeVisible(parentAction, parentAction?.reportActionID ?? '-1', canUserPerformWriteAction);

                // Pop the thread report screen before navigating to the chat report.
                Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(finalParentReportID));
                if (isVisibleAction && !isOffline) {
                    // Pop the chat report screen before navigating to the linked report action.
                    Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(finalParentReportID, finalParentReportActionID), true);
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
                {!!workspaceName && <Text style={[styles.optionAlternateText, styles.textLabelSupporting]}>{` ${translate('threads.in')} ${workspaceName}`}</Text>}
            </Text>
        </PressableWithoutFeedback>
    );
}

ParentNavigationSubtitle.displayName = 'ParentNavigationSubtitle';
export default ParentNavigationSubtitle;
