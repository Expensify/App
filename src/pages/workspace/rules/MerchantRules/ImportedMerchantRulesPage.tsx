import React, {useCallback, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ColumnRole} from '@components/ImportColumn';
import ImportSpreadsheetColumns from '@components/ImportSpreadsheetColumns';
import ScreenWrapper from '@components/ScreenWrapper';
import useCloseImportPage from '@hooks/useCloseImportPage';
import useImportSpreadsheetConfirmModal from '@hooks/useImportSpreadsheetConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {ImportedMerchantRule} from '@libs/actions/Policy/Rules';
import {importMerchantRulesSpreadsheet} from '@libs/actions/Policy/Rules';
import {findDuplicate, generateColumnNames} from '@libs/importSpreadsheetUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {rand64} from '@libs/NumberUtils';
import Parser from '@libs/Parser';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

/** Column roles that update the matched expense; at least one must be mapped alongside a merchant filter */
const ACTION_COLUMNS: string[] = [
    CONST.CSV_IMPORT_COLUMNS.UPDATED_MERCHANT,
    CONST.CSV_IMPORT_COLUMNS.CATEGORY,
    CONST.CSV_IMPORT_COLUMNS.COMMENT,
    CONST.CSV_IMPORT_COLUMNS.REIMBURSABLE,
    CONST.CSV_IMPORT_COLUMNS.BILLABLE,
];

/** Parses a CSV cell into a boolean, or undefined when the cell is empty or unrecognized so the field is left unset */
function parseCsvBooleanValue(raw: string | undefined): boolean | undefined {
    const trimmed = raw?.trim().toLowerCase() ?? '';
    if (['true', 'yes'].includes(trimmed)) {
        return true;
    }
    if (['false', 'no'].includes(trimmed)) {
        return false;
    }
    return undefined;
}

type ImportedMerchantRulesPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_IMPORTED>;

function ImportedMerchantRulesPage({route}: ImportedMerchantRulesPageProps) {
    const {translate} = useLocalize();
    const [spreadsheet, spreadsheetMetadata] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const [isImportingRules, setIsImportingRules] = useState(false);
    const {containsHeader = true} = spreadsheet ?? {};
    const [isValidationEnabled, setIsValidationEnabled] = useState(false);
    const policyID = route.params.policyID;

    const {setIsClosing} = useCloseImportPage();
    const showImportSpreadsheetConfirmModal = useImportSpreadsheetConfirmModal();

    const columnNames = generateColumnNames(spreadsheet?.data?.length ?? 0);

    const columnRoles: ColumnRole[] = [
        {text: translate('common.ignore'), value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
        {text: translate('workspace.rules.merchantRules.importColumnMerchantIs'), value: CONST.CSV_IMPORT_COLUMNS.MERCHANT_IS},
        {text: translate('workspace.rules.merchantRules.importColumnMerchantContains'), value: CONST.CSV_IMPORT_COLUMNS.MERCHANT_CONTAINS},
        {text: translate('workspace.rules.merchantRules.importColumnUpdatedMerchant'), value: CONST.CSV_IMPORT_COLUMNS.UPDATED_MERCHANT},
        {text: translate('workspace.rules.merchantRules.importColumnUpdatedCategory'), value: CONST.CSV_IMPORT_COLUMNS.CATEGORY},
        {text: translate('workspace.rules.merchantRules.importColumnUpdatedDescription'), value: CONST.CSV_IMPORT_COLUMNS.COMMENT},
        {text: translate('common.reimbursable'), value: CONST.CSV_IMPORT_COLUMNS.REIMBURSABLE},
        {text: translate('common.billable'), value: CONST.CSV_IMPORT_COLUMNS.BILLABLE},
    ];

    const validate = useCallback(() => {
        const columns = Object.values(spreadsheet?.columns ?? {});
        let errors: Errors = {};

        const hasMerchantFilterColumn = columns.includes(CONST.CSV_IMPORT_COLUMNS.MERCHANT_IS) || columns.includes(CONST.CSV_IMPORT_COLUMNS.MERCHANT_CONTAINS);
        const hasActionColumn = ACTION_COLUMNS.some((actionColumn) => columns.includes(actionColumn));

        if (!hasMerchantFilterColumn || !hasActionColumn) {
            errors.required = translate('spreadsheet.importMerchantRulesRequiredColumns');
        } else {
            const duplicate = findDuplicate(columns);
            const duplicateColumn = columnRoles.find((role) => role.value === duplicate);

            if (duplicateColumn) {
                errors.duplicates = translate('spreadsheet.singleFieldMultipleColumns', duplicateColumn.text);
            } else {
                errors = {};
            }
        }
        return errors;
    }, [spreadsheet?.columns, translate, columnRoles]);

    const closeImportPageAndModal = () => {
        setIsClosing(true);
        setIsImportingRules(false);
        Navigation.goBack(ROUTES.WORKSPACE_RULES.getRoute(policyID));
    };

    const importRules = async () => {
        setIsValidationEnabled(true);
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            return;
        }

        const columns = Object.values(spreadsheet?.columns ?? {});
        const merchantIsColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.MERCHANT_IS);
        const merchantContainsColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.MERCHANT_CONTAINS);
        const updatedMerchantColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.UPDATED_MERCHANT);
        const categoryColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.CATEGORY);
        const commentColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.COMMENT);
        const reimbursableColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.REIMBURSABLE);
        const billableColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.BILLABLE);

        const rowCount = (spreadsheet?.data.at(0)?.length ?? 0) - (containsHeader ? 1 : 0);
        const getCellValue = (columnIndex: number, rowIndex: number): string => {
            if (columnIndex === -1) {
                return '';
            }
            const dataIndex = containsHeader ? rowIndex + 1 : rowIndex;
            return spreadsheet?.data.at(columnIndex)?.at(dataIndex)?.toString().trim() ?? '';
        };

        const rules: Record<string, ImportedMerchantRule> = {};
        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            // "Merchant is" wins when both filter columns have a value for the same row
            const merchantIsValue = getCellValue(merchantIsColumn, rowIndex);
            const merchantToMatch = merchantIsValue || getCellValue(merchantContainsColumn, rowIndex);
            if (!merchantToMatch) {
                continue;
            }

            const updatedMerchant = getCellValue(updatedMerchantColumn, rowIndex);
            const category = getCellValue(categoryColumn, rowIndex);
            const comment = getCellValue(commentColumn, rowIndex);
            const reimbursable = parseCsvBooleanValue(getCellValue(reimbursableColumn, rowIndex));
            const billable = parseCsvBooleanValue(getCellValue(billableColumn, rowIndex));

            rules[rand64()] = {
                filters: {
                    left: 'merchant',
                    operator: merchantIsValue ? CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO : CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
                    right: merchantToMatch,
                },
                ...(updatedMerchant && {merchant: updatedMerchant}),
                ...(category && {category}),
                ...(comment && {comment: Parser.replace(comment)}),
                ...(reimbursable !== undefined && {reimbursable}),
                ...(billable !== undefined && {billable}),
                created: new Date().toISOString(),
            };
        }

        setIsImportingRules(true);
        const importFinalModal = await importMerchantRulesSpreadsheet(policyID, rules);
        const didShowImportFinalModal = await showImportSpreadsheetConfirmModal(importFinalModal, {shouldHandleNavigationBack: false});
        if (!didShowImportFinalModal) {
            setIsImportingRules(false);
            return;
        }
        closeImportPageAndModal();
    };

    if (!spreadsheet && isLoadingOnyxValue(spreadsheetMetadata)) {
        return;
    }

    const spreadsheetColumns = spreadsheet?.data;

    if (!spreadsheetColumns) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                testID="ImportedMerchantRulesPage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.merchantRules.importRulesTitle')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.RULES_MERCHANT_IMPORT.getRoute(policyID))}
                />
                <ImportSpreadsheetColumns
                    spreadsheetColumns={spreadsheetColumns}
                    columnNames={columnNames}
                    importFunction={importRules}
                    errors={isValidationEnabled ? validate() : undefined}
                    columnRoles={columnRoles}
                    isButtonLoading={isImportingRules}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default ImportedMerchantRulesPage;
