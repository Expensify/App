import OfflineWithFeedback from '@components/OfflineWithFeedback';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useSaveReportField from '@hooks/useSaveReportField';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearReportFieldKeyErrors} from '@libs/actions/Report';
import {resolveReportFieldValue} from '@libs/Formula';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    getFieldViolation,
    getFieldViolationTranslation,
    getReportFieldKey,
    getReportFieldMaps,
    isReportFieldDisabledForUser,
    isReportFieldTargetMatchingReport,
    shouldDisplayReportFields as shouldDisplayReportFieldsUtils,
    shouldHideSingleReportField,
} from '@libs/ReportUtils';

import type {ThemeStyles} from '@styles/index';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyReportField, Report, ReportViolationName} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useMemo} from 'react';
import {View} from 'react-native';

import ReportFieldInlineInput from './ReportFieldInlineInput';

type MoneyRequestViewReportFieldsProps = {
    report: OnyxEntry<Report>;

    /** Policy that the report belongs to */
    policy: OnyxEntry<Policy>;

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

function ReportFieldView(
    reportField: EnrichedPolicyReportField,
    report: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    styles: ThemeStyles,
    onSaveValue: (reportField: PolicyReportField, value: string) => void,
    pendingAction?: PendingAction,
) {
    return (
        <View
            key={`reportField-${reportField.fieldKey}`}
            style={styles.flex1}
        >
            <OfflineWithFeedback
                // Need to return undefined when we have pendingAction to avoid the duplicate pending action
                pendingAction={pendingAction ? undefined : report?.pendingFields?.[reportField.fieldKey as keyof typeof report.pendingFields]}
                onClose={() => clearReportFieldKeyErrors(report?.reportID, reportField.fieldKey)}
            >
                <ReportFieldInlineInput
                    reportField={reportField}
                    fieldKey={reportField.fieldKey}
                    value={reportField.fieldValue}
                    isDisabled={reportField.isFieldDisabled}
                    errorText={reportField.violationTranslation}
                    fieldList={policy?.fieldList}
                    onSaveValue={(value) => onSaveValue(reportField, value)}
                />
            </OfflineWithFeedback>
        </View>
    );
}
function MoneyRequestViewReportFields({report, policy, pendingAction}: MoneyRequestViewReportFieldsProps) {
    const styles = useThemeStyles();
    // The report view is a RightModalNavigator screen shown as a wide RHP, where `useResponsiveLayout` reports a narrow layout at any pane width.
    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();
    const saveReportField = useSaveReportField(report, policy);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(report?.reportID)}`);
    const {getCurrencyDecimals} = useCurrencyListActions();
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const sortedPolicyReportFields = useMemo<EnrichedPolicyReportField[]>((): EnrichedPolicyReportField[] => {
        const {fieldValues, fieldsByName} = getReportFieldMaps(report, policy?.fieldList ?? {}, reportNameValuePairs);
        const fields = Object.values(fieldsByName);

        return fields
            .filter((field) => isReportFieldTargetMatchingReport(report, field))
            .filter((reportField) => !shouldHideSingleReportField(reportField))
            .sort(({orderWeight: firstOrderWeight}, {orderWeight: secondOrderWeight}) => firstOrderWeight - secondOrderWeight)
            .map((field): EnrichedPolicyReportField => {
                const fieldValue = resolveReportFieldValue(field, report, policy, fieldValues, fieldsByName, getCurrencyDecimals);
                const isFieldDisabled = isReportFieldDisabledForUser(report, field, policy, currentUserAccountID, rules);
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
    }, [policy, report, currentUserAccountID, reportNameValuePairs, getCurrencyDecimals, rules]);

    // `sortedPolicyReportFields` already excludes fields hidden by `shouldHideSingleReportField`, including the title field.
    // If no displayable custom fields remain, the early return below hides the section.
    const shouldDisplayReportFields = shouldDisplayReportFieldsUtils(report, policy);

    if (!shouldDisplayReportFields || !sortedPolicyReportFields.length) {
        return null;
    }

    const columnCount = shouldUseNarrowLayout ? 1 : CONST.REPORT_FIELDS_PER_ROW;
    const fieldRows: EnrichedPolicyReportField[][] = [];
    for (let index = 0; index < sortedPolicyReportFields.length; index += columnCount) {
        fieldRows.push(sortedPolicyReportFields.slice(index, index + columnCount));
    }

    return (
        <View style={[styles.ph5, styles.mb3, styles.gap3]}>
            {fieldRows.map((fieldRow) => {
                const rowKey = `reportFieldRow-${fieldRow.at(0)?.fieldKey}`;

                return (
                    <View
                        key={rowKey}
                        testID="reportFieldsRow"
                        // Each cell sizes to its own content and hugs the top of the row, so a field showing an error
                        // message grows downwards instead of stretching the cells beside it and shifting their inputs.
                        style={[styles.flexRow, styles.gap3, styles.alignItemsStart]}
                    >
                        {fieldRow.map((reportField) => ReportFieldView(reportField, report, policy, styles, saveReportField, pendingAction))}
                        {/* A partly filled last row is padded out so its fields stay the same width as the rows above it. */}
                        {Array.from({length: columnCount - fieldRow.length}, (_unused, index) => (
                            <View
                                key={`${rowKey}-spacer-${index}`}
                                style={styles.flex1}
                            />
                        ))}
                    </View>
                );
            })}
        </View>
    );
}

export default MoneyRequestViewReportFields;
