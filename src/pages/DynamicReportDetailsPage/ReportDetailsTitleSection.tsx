import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ParentNavigationSubtitle from '@components/ParentNavigationSubtitle';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {
    canEditReportTitle,
    getAvailableReportFields,
    getParentNavigationSubtitle,
    getReportFieldKey,
    isInvoiceReport,
    isMoneyRequest,
    isMoneyRequestReport,
    isReportFieldDisabled,
    isReportFieldOfTypeTitle,
    isTaskReport,
} from '@libs/ReportUtils';

import {clearPolicyRoomNameErrors} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy, Report, ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import type {CaseID} from './types';

import {CASES} from './types';
import useReportDetailsReportName from './useReportDetailsReportName';

type ReportDetailsTitleSectionProps = {
    report: Report;
    policy: OnyxEntry<Policy>;
    parentReport: OnyxEntry<Report>;
    parentReportAction: OnyxEntry<ReportAction>;
    caseID: CaseID;
};

/** Title row (editable report title field) and "From" row shown for expense, invoice and money request reports */
function ReportDetailsTitleSection({report, policy, parentReport, parentReportAction, caseID}: ReportDetailsTitleSectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isParentReportArchived = useReportIsArchived(parentReport?.reportID);
    const {reportName, derivedParentReportName} = useReportDetailsReportName(report, parentReport, parentReportAction);

    const titleField = getAvailableReportFields(report, Object.values(policy?.fieldList ?? {})).find((reportField) => isReportFieldOfTypeTitle(reportField));
    const fieldKey = getReportFieldKey(titleField?.fieldID);
    const isFieldDisabled = isReportFieldDisabled(report, titleField, policy);
    const shouldShowEditableTitleField = caseID !== CASES.MONEY_REQUEST && canEditReportTitle(report, policy, currentUserPersonalDetails?.accountID);

    const parentNavigationSubtitleData = getParentNavigationSubtitle(report, policy, conciergeReportID, translate, derivedParentReportName, isParentReportArchived);
    const shouldShowFurtherDetailsContent =
        !isEmptyObject(parentNavigationSubtitleData) &&
        (shouldShowEditableTitleField || isMoneyRequestReport(report) || isInvoiceReport(report) || isMoneyRequest(report) || isTaskReport(report));

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
