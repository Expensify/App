import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useOnyx from '@hooks/useOnyx';
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
    isReportFieldDisabledForUser,
    isReportFieldOfTypeTitle,
    shouldHideSingleReportField,
} from '@libs/ReportUtils';
import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, PolicyReportField, Report, ReportViolationName} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

type MoneyRequestViewReportFieldsProps = {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** Policy that the report belongs to */
    policy: OnyxEntry<Policy>;

    /** Indicates whether the IOU report is a combined report */
    isCombinedReport?: boolean;

    /** Indicates whether we have any pending actions from parent component */
    pendingAction?: PendingAction;
};

type EnrichedPolicyReportField = {
    fieldValue: string;
    isFieldDisabled: boolean;
    fieldKey: string;
    violation: ReportViolationName | undefined;
    violationTranslation: string;
} & PolicyReportField;

function ReportFieldView(reportField: EnrichedPolicyReportField, report: OnyxEntry<Report>, styles: ThemeStyles, pendingAction?: PendingAction) {
    return (
        <OfflineWithFeedback
            // Need to return undefined when we have pendingAction to avoid the duplicate pending action
            pendingAction={pendingAction ? undefined : report?.pendingFields?.[reportField.fieldKey as keyof typeof report.pendingFields]}
            errorRowStyles={styles.ph5}
            key={`menuItem-${reportField.fieldKey}`}
            onClose={() => clearReportFieldKeyErrors(report?.reportID, reportField.fieldKey)}
        >
            <MenuItemWithTopDescription
                description={Str.UCFirst(reportField.name)}
                title={reportField.fieldValue}
                onPress={() => {
                    Navigation.navigate(ROUTES.EDIT_REPORT_FIELD_REQUEST.getRoute(report?.reportID, report?.policyID, reportField.fieldID, Navigation.getActiveRoute()));
                }}
                shouldShowRightIcon={!reportField.isFieldDisabled}
                wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
                shouldGreyOutWhenDisabled={false}
                numberOfLinesTitle={0}
                interactive={!reportField.isFieldDisabled}
                shouldStackHorizontally={false}
                onSecondaryInteraction={() => {}}
                titleWithTooltips={[]}
                brickRoadIndicator={reportField.violation ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={reportField.violationTranslation}
            />
        </OfflineWithFeedback>
    );
}
function MoneyRequestViewReportFields({report, policy, isCombinedReport = false, pendingAction}: MoneyRequestViewReportFieldsProps) {
    const styles = useThemeStyles();

    const [violations] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_VIOLATIONS}${report?.reportID}`, {canBeMissing: true});

    const sortedPolicyReportFields = useMemo<EnrichedPolicyReportField[]>((): EnrichedPolicyReportField[] => {
        const fields = getAvailableReportFields(report, Object.values(policy?.fieldList ?? {}));
        return fields
            .filter((field) => field.target === report?.type)
            .filter((reportField) => !shouldHideSingleReportField(reportField))
            .sort(({orderWeight: firstOrderWeight}, {orderWeight: secondOrderWeight}) => firstOrderWeight - secondOrderWeight)
            .map((field): EnrichedPolicyReportField => {
                const fieldValue = field.value ?? field.defaultValue;
                const isFieldDisabled = isReportFieldDisabledForUser(report, field, policy);
                const isDeletedFormulaField = field.type === CONST.REPORT_FIELD_TYPES.FORMULA && field.deletable;
                const fieldKey = getReportFieldKey(field.fieldID);

                const violation = isFieldDisabled ? undefined : getFieldViolation(violations, field);
                const violationTranslation = getFieldViolationTranslation(field, violation);

                return {
                    ...field,
                    fieldValue,
                    isFieldDisabled: isFieldDisabled && !isDeletedFormulaField,
                    fieldKey,
                    violation,
                    violationTranslation,
                };
            });
    }, [policy, report, violations]);

    const enabledReportFields = sortedPolicyReportFields.filter(
        (reportField) => !isReportFieldDisabled(report, reportField, policy) || reportField.type === CONST.REPORT_FIELD_TYPES.FORMULA,
    );
    const isOnlyTitleFieldEnabled = enabledReportFields.length === 1 && isReportFieldOfTypeTitle(enabledReportFields.at(0));
    const isPaidGroupPolicyExpenseReport = isPaidGroupPolicyExpenseReportUtils(report);
    const isInvoiceReport = isInvoiceReportUtils(report);

    const shouldDisplayReportFields = (isPaidGroupPolicyExpenseReport || isInvoiceReport) && !!policy?.areReportFieldsEnabled && (!isOnlyTitleFieldEnabled || !isCombinedReport);

    return (
        shouldDisplayReportFields &&
        sortedPolicyReportFields.map((reportField) => {
            return ReportFieldView(reportField, report, styles, pendingAction);
        })
    );
}

export default MoneyRequestViewReportFields;
