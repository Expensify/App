import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearReportFieldKeyErrors} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {
    getAvailableReportFields,
    getFieldViolation,
    getFieldViolationTranslation,
    getReportFieldKey,
    isInvoiceReport as isInvoiceReportUtils,
    isPaidGroupPolicyExpenseReport as isPaidGroupPolicyExpenseReportUtils,
    isReportFieldDisabled,
    isReportFieldOfTypeTitle,
} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, PolicyReportField, Report} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

type MoneyRequestViewReportFieldsProps = {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** Policy that the report belongs to */
    policy: OnyxEntry<Policy>;

    /** Indicates whether the iou report is a combine report */
    isCombinedReport?: boolean;

    pendingAction?: PendingAction;
};

function MoneyRequestViewReportFields({report, policy, isCombinedReport = false, pendingAction}: MoneyRequestViewReportFieldsProps) {
    const styles = useThemeStyles();

    const sortedPolicyReportFields = useMemo<PolicyReportField[]>((): PolicyReportField[] => {
        const fields = getAvailableReportFields(report, Object.values(policy?.fieldList ?? {}));
        return fields.filter((field) => field.target === report?.type).sort(({orderWeight: firstOrderWeight}, {orderWeight: secondOrderWeight}) => firstOrderWeight - secondOrderWeight);
    }, [policy, report]);

    const enabledReportFields = sortedPolicyReportFields.filter((reportField) => !isReportFieldDisabled(report, reportField, policy));
    const isOnlyTitleFieldEnabled = enabledReportFields.length === 1 && isReportFieldOfTypeTitle(enabledReportFields.at(0));
    const isPaidGroupPolicyExpenseReport = isPaidGroupPolicyExpenseReportUtils(report);
    const isInvoiceReport = isInvoiceReportUtils(report);

    const [violations] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_VIOLATIONS}${report?.reportID}`);

    const shouldHideSingleReportField = (reportField: PolicyReportField) => {
        const fieldValue = reportField.value ?? reportField.defaultValue;
        const hasEnableOption = reportField.type !== CONST.REPORT_FIELD_TYPES.LIST || reportField.disabledOptions.some((option) => !option);

        return isReportFieldOfTypeTitle(reportField) || (!fieldValue && !hasEnableOption);
    };
    function getReportFieldView(reportField: PolicyReportField) {
        if (shouldHideSingleReportField(reportField)) {
            return null;
        }
        const fieldValue = reportField.value ?? reportField.defaultValue;
        const isFieldDisabled = isReportFieldDisabled(report, reportField, policy);
        const fieldKey = getReportFieldKey(reportField.fieldID);

        const violation = getFieldViolation(violations, reportField);
        const violationTranslation = getFieldViolationTranslation(reportField, violation);

        return (
            <OfflineWithFeedback
                // Need to return undefined when we have pendingAction to avoid the duplicate pending action
                pendingAction={pendingAction ? undefined : report?.pendingFields?.[fieldKey as keyof typeof report.pendingFields]}
                errors={report?.errorFields?.[fieldKey]}
                errorRowStyles={styles.ph5}
                key={`menuItem-${fieldKey}`}
                onClose={() => clearReportFieldKeyErrors(report?.reportID, fieldKey)}
            >
                <MenuItemWithTopDescription
                    description={Str.UCFirst(reportField.name)}
                    title={fieldValue}
                    onPress={() => {
                        Navigation.navigate(ROUTES.EDIT_REPORT_FIELD_REQUEST.getRoute(report?.reportID, report?.policyID, reportField.fieldID, Navigation.getReportRHPActiveRoute()));
                    }}
                    shouldShowRightIcon
                    disabled={isFieldDisabled}
                    wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
                    shouldGreyOutWhenDisabled={false}
                    numberOfLinesTitle={0}
                    interactive
                    shouldStackHorizontally={false}
                    onSecondaryInteraction={() => {}}
                    titleWithTooltips={[]}
                    brickRoadIndicator={violation ? 'error' : undefined}
                    errorText={violationTranslation}
                />
            </OfflineWithFeedback>
        );
    }
    return (
        (isPaidGroupPolicyExpenseReport || isInvoiceReport) &&
        policy?.areReportFieldsEnabled &&
        (!isOnlyTitleFieldEnabled || !isCombinedReport) &&
        sortedPolicyReportFields.map((reportField) => {
            return getReportFieldView(reportField);
        })
    );
}
MoneyRequestViewReportFields.displayName = 'MoneyRequestViewReportFields';

export default MoneyRequestViewReportFields;
