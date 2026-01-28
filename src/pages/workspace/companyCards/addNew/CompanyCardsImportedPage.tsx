import React, {useCallback, useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ColumnRole} from '@components/ImportColumn';
import ImportSpreadsheetColumns from '@components/ImportSpreadsheetColumns';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {findDuplicate, generateColumnNames} from '@libs/importSpreadsheetUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {importCSVCompanyCards} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type CompanyCardsImportedPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_IMPORTED>;

function CompanyCardsImportedPage({route}: CompanyCardsImportedPageProps) {
    const {translate} = useLocalize();
    const [spreadsheet, spreadsheetMetadata] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET, {canBeMissing: true});
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});
    const policyID = route.params.policyID;
    const shouldUseAdvancedFields = addNewCard?.data?.useAdvancedFields ?? false;
    const templateName = addNewCard?.data?.companyCardLayoutName ?? '';

    const columnNames = useMemo(() => generateColumnNames(spreadsheet?.data?.length ?? 0), [spreadsheet?.data?.length]);

    const columnRoles: ColumnRole[] = useMemo(() => {
        const baseRoles: ColumnRole[] = [
            {text: translate('workspace.companyCards.addNewCard.csvColumns.ignore'), value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
            {text: translate('workspace.companyCards.addNewCard.csvColumns.cardNumber'), value: CONST.CSV_IMPORT_COLUMNS.CARD_NUMBER, isRequired: true},
            {text: translate('workspace.companyCards.addNewCard.csvColumns.date'), value: CONST.CSV_IMPORT_COLUMNS.DATE, isRequired: true},
            {text: translate('workspace.companyCards.addNewCard.csvColumns.merchant'), value: CONST.CSV_IMPORT_COLUMNS.MERCHANT, isRequired: true},
            {text: translate('workspace.companyCards.addNewCard.csvColumns.amount'), value: CONST.CSV_IMPORT_COLUMNS.AMOUNT, isRequired: true},
            {text: translate('workspace.companyCards.addNewCard.csvColumns.currency'), value: CONST.CSV_IMPORT_COLUMNS.CURRENCY, isRequired: true},
        ];

        if (!shouldUseAdvancedFields) {
            return baseRoles;
        }

        const advancedRoles: ColumnRole[] = [
            {text: translate('workspace.companyCards.addNewCard.csvColumns.originalTransactionDate'), value: CONST.CSV_IMPORT_COLUMNS.ORIGINAL_TRANSACTION_DATE},
            {text: translate('workspace.companyCards.addNewCard.csvColumns.originalAmount'), value: CONST.CSV_IMPORT_COLUMNS.ORIGINAL_AMOUNT},
            {text: translate('workspace.companyCards.addNewCard.csvColumns.originalCurrency'), value: CONST.CSV_IMPORT_COLUMNS.ORIGINAL_CURRENCY},
            {text: translate('workspace.companyCards.addNewCard.csvColumns.comment'), value: CONST.CSV_IMPORT_COLUMNS.COMMENT},
            {text: translate('workspace.companyCards.addNewCard.csvColumns.category'), value: CONST.CSV_IMPORT_COLUMNS.CATEGORY},
            {text: translate('workspace.companyCards.addNewCard.csvColumns.tag'), value: CONST.CSV_IMPORT_COLUMNS.TAG},
            {text: translate('workspace.companyCards.addNewCard.csvColumns.uniqueID'), value: CONST.CSV_IMPORT_COLUMNS.UNIQUE_ID},
        ];

        return [...baseRoles, ...advancedRoles];
    }, [shouldUseAdvancedFields, translate]);

    const requiredColumns = useMemo(() => columnRoles.filter((role) => role.isRequired), [columnRoles]);

    const validate = useCallback(() => {
        const columns = Object.values(spreadsheet?.columns ?? {});
        let errors: Errors = {};

        const missingRequiredColumns = requiredColumns.filter((requiredColumn) => !columns.includes(requiredColumn.value)).map((requiredColumn) => requiredColumn.text).join(', ');
        if (missingRequiredColumns) {
            errors.required = translate('workspace.companyCards.addNewCard.csvErrors.requiredColumns', missingRequiredColumns);
        } else {
            const duplicate = findDuplicate(columns);
            if (duplicate) {
                errors.duplicates = translate('workspace.companyCards.addNewCard.csvErrors.duplicateColumns', duplicate);
            } else {
                errors = {};
            }
        }
        return errors;
    }, [spreadsheet?.columns, requiredColumns, translate]);

    const validationErrors = useMemo(() => validate(), [validate]);

    const importTransactions = useCallback(() => {
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            return;
        }

        if (!templateName) {
            return;
        }

        const templateSettings = columnNames.map((_, index) => spreadsheet?.columns?.[index] ?? CONST.CSV_IMPORT_COLUMNS.IGNORE);
        const columns = spreadsheet?.data ?? [];
        const rows = columns.at(0)?.map((_, rowIndex) => columns.map((column) => column.at(rowIndex) ?? '')) ?? [];
        importCSVCompanyCards(policyID, templateName, templateSettings, rows);
    }, [columnNames, policyID, spreadsheet?.columns, spreadsheet?.data, templateName, validate]);

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
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID="CompanyCardsImportedPage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    title={translate('spreadsheet.importSpreadsheet')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS_IMPORT_SPREADSHEET.getRoute(policyID))}
                />
                <ImportSpreadsheetColumns
                    spreadsheetColumns={spreadsheetColumns}
                    columnNames={columnNames}
                    importFunction={importTransactions}
                    errors={validationErrors}
                    columnRoles={columnRoles}
                    learnMoreLink={CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CompanyCardsImportedPage.displayName = 'CompanyCardsImportedPage';

export default CompanyCardsImportedPage;

