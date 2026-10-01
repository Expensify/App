import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ParentNavigationSubtitle from '@components/ParentNavigationSubtitle';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {
    canEditReportTitle,
    getAvailableReportFields,
    getParentNavigationSubtitle,
    getReportFieldKey,
    isInvoiceReport as isInvoiceReportUtil,
    isMoneyRequest as isMoneyRequestUtil,
    isMoneyRequestReport as isMoneyRequestReportUtil,
    isReportFieldDisabled,
    isReportFieldOfTypeTitle,
    isTaskReport as isTaskReportUtil,
    isTrackExpenseReportNew as isTrackExpenseReportUtil,
} from '@libs/ReportUtils';

import {clearPolicyRoomNameErrors} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';
import {View} from 'react-native';

import getReportDetailsCaseID from './getReportDetailsCaseID';
import {CASES} from './types';
import useReportDetailsReportName from './useReportDetailsReportName';

type ReportDetailsTitleSectionProps = {
    reportID: string;
};

/** Title row backed by the workspace title report field, plus the "From" row, rendered for expense, invoice and money request reports */
function ReportDetailsTitleSection({reportID}: ReportDetailsTitleSectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails?.accountID;
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const parentReportAction = useParentReportAction(report);
    const isParentReportArchived = useReportIsArchived(parentReport?.reportID);
    const {reportName, derivedParentReportName} = useReportDetailsReportName(report, parentReport, parentReportAction);

    if (!report?.reportID) {
        return null;
    }

    const isMoneyRequestReport = isMoneyRequestReportUtil(report);
    const isInvoiceReport = isInvoiceReportUtil(report);
    const isMoneyRequest = isMoneyRequestUtil(report);
    const isTaskReport = isTaskReportUtil(report);
    const caseID = getReportDetailsCaseID({
        isMoneyRequestReport,
        isInvoiceReport,
        isMoneyRequest,
        isTrackExpenseReport: isTrackExpenseReportUtil(report, parentReport, parentReportAction),
    });
    const parentNavigationSubtitleData = getParentNavigationSubtitle(report, policy, conciergeReportID, translate, derivedParentReportName, isParentReportArchived);

    const titleField: OnyxTypes.PolicyReportField | undefined = (() => {
        const fields = getAvailableReportFields(report, Object.values(policy?.fieldList ?? {}));
        return fields.find((reportField) => isReportFieldOfTypeTitle(reportField));
    })();
    const fieldKey = getReportFieldKey(titleField?.fieldID);
    const isFieldDisabled = isReportFieldDisabled(report, titleField, policy, rules);

    const shouldShowEditableTitleField = caseID !== CASES.MONEY_REQUEST && canEditReportTitle(report, policy, currentUserAccountID, rules);

    const shouldShowFurtherDetailsContent =
        !isEmptyObject(parentNavigationSubtitleData) && (shouldShowEditableTitleField || isMoneyRequestReport || isInvoiceReport || isMoneyRequest || isTaskReport);

    return (
        <>
            <OfflineWithFeedback
                pendingAction={report.pendingFields?.reportName}
                errors={report.errorFields?.reportName ?? null}
                errorRowStyles={styles.ph5}
                key={`menuItem-${fieldKey}`}
                onClose={() => clearPolicyRoomNameErrors(report.reportID)}
            >
                <View style={[styles.flex1]}>
                    <MenuItemWithTopDescription
                        shouldShowRightIcon={shouldShowEditableTitleField && !isFieldDisabled}
                        interactive={shouldShowEditableTitleField && !isFieldDisabled}
                        title={reportName}
                        titleStyle={styles.newKansasLarge}
                        shouldCheckActionAllowedOnPress={false}
                        description={translate('task.title')}
                        onPress={
                            shouldShowEditableTitleField && report.policyID
                                ? () => {
                                      if (!report?.policyID) {
                                          return;
                                      }

                                      Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.EDIT_REPORT_FIELD.getRoute(report.policyID, CONST.REPORT_FIELD_TITLE_FIELD_ID)));
                                  }
                                : undefined
                        }
                    />
                </View>
            </OfflineWithFeedback>
            {shouldShowFurtherDetailsContent && (
                <MenuItemWithTopDescription
                    shouldShowRightIcon={false}
                    interactive={false}
                    titleComponent={
                        <ParentNavigationSubtitle
                            parentNavigationSubtitleData={parentNavigationSubtitleData}
                            reportID={report?.reportID}
                            parentReportID={report?.parentReportID}
                            parentReportActionID={report?.parentReportActionID}
                            pressableStyles={[styles.mt1, styles.mw100]}
                            textStyles={[styles.popoverMenuText, styles.flexShrink1, styles.preWrap, styles.mw100]}
                            subtitleNumberOfLines={2}
                            shouldShowFromPrefix={false}
                            openParentReportInCurrentTab
                        />
                    }
                    description={translate('threads.from')}
                    descriptionTextStyle={[styles.mutedNormalTextLabel, styles.mb1]}
                    shouldCheckActionAllowedOnPress={false}
                />
            )}
        </>
    );
}

export default ReportDetailsTitleSection;
