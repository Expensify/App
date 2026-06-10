import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearReportFieldKeyErrors} from '@libs/actions/Report';
import {resolveReportFieldValue} from '@libs/Formula';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {
    getFieldViolation,
    getFieldViolationTranslation,
    getReportFieldKey,
    getReportFieldMaps,
    isGroupPolicyExpenseReport as isGroupPolicyExpenseReportUtils,
    isInvoiceReport as isInvoiceReportUtils,
    isReportFieldDisabled,
    isReportFieldDisabledForUser,
    isReportFieldOfTypeTitle,
    shouldHideSingleReportField,
} from '@libs/ReportUtils';
import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
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
                    if (!report?.policyID) {
                        return;
                    }

                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.EDIT_REPORT_FIELD.getRoute(report.policyID, reportField.fieldID)));
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
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const sortedPolicyReportFields = useMemo<EnrichedPolicyReportField[]>((): EnrichedPolicyReportField[] => {
        const {fieldValues, fieldsByName} = getReportFieldMaps(report, policy?.fieldList ?? {});
        const fields = Object.values(fieldsByName);

        return fields
            .filter((field) => field.target === report?.type)
            .filter((reportField) => !shouldHideSingleReportField(reportField))
            .sort(({orderWeight: firstOrderWeight}, {orderWeight: secondOrderWeight}) => firstOrderWeight - secondOrderWeight)
            .map((field): EnrichedPolicyReportField => {
                const fieldValue = resolveReportFieldValue(field, report, policy, fieldValues, fieldsByName);
                const isFieldDisabled = isReportFieldDisabledForUser(report, field, policy, currentUserAccountID);
                const isDeletedFormulaField = field.type === CONST.REPORT_FIELD_TYPES.FORMULA && field.deletable;
                const fieldKey = getReportFieldKey(field.fieldID);

                const violation = isFieldDisabled ? undefined : getFieldViolation(field);
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
    }, [policy, report, currentUserAccountID]);

    const enabledReportFields = sortedPolicyReportFields.filter(
        (reportField) => !isReportFieldDisabled(report, reportField, policy) || reportField.type === CONST.REPORT_FIELD_TYPES.FORMULA,
    );
    const isOnlyTitleFieldEnabled = enabledReportFields.length === 1 && isReportFieldOfTypeTitle(enabledReportFields.at(0));
    const isGroupPolicyExpenseReport = isGroupPolicyExpenseReportUtils(report);
    const isInvoiceReport = isInvoiceReportUtils(report);
    const areFieldsEnabledForReport = isInvoiceReport ? policy?.areInvoiceFieldsEnabled : policy?.areReportFieldsEnabled;

    const shouldDisplayReportFields = (isGroupPolicyExpenseReport || isInvoiceReport) && !!areFieldsEnabledForReport && (!isOnlyTitleFieldEnabled || !isCombinedReport);

    if (!shouldDisplayReportFields || !sortedPolicyReportFields.length) {
        return null;
    }

    return (
        <View style={styles.mb3}>
            {sortedPolicyReportFields.map((reportField) => {
                return ReportFieldView(reportField, report, styles, pendingAction);
            })}
        </View>
    );
}

export default MoneyRequestViewReportFields;
