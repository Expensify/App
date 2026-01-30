import React, {useCallback, useMemo, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ColumnRole} from '@components/ImportColumn';
import ImportSpreadsheetConfirmModal from '@components/ImportSpreadsheetConfirmModal';
import ImportSpreadsheetColumns from '@components/ImportSpreadsheetColumns';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {findDuplicate, generateColumnNames} from '@libs/importSpreadsheetUtils';
import {rand64} from '@libs/NumberUtils';
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
    const policy = usePolicy(policyID);
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`, {canBeMissing: true});
    const [isImportingTransactions, setIsImportingTransactions] = useState(false);
    const shouldUseAdvancedFields = addNewCard?.data?.useAdvancedFields ?? false;
    const layoutName = addNewCard?.data?.companyCardLayoutName ?? '';
    const prefilledLayoutType = addNewCard?.data?.layoutType;
    const layoutType = useMemo(
        () => prefilledLayoutType ?? `${CONST.COMPANY_CARD.FEED_BANK_NAME.CSV}_${rand64()}_`,
        [prefilledLayoutType],
    );
    const [existingCardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${layoutType}`, {canBeMissing: true});

    const columnNames = useMemo(() => generateColumnNames(spreadsheet?.data?.length ?? 0), [spreadsheet?.data?.length]);

    const columnRoles: ColumnRole[] = useMemo(() => {
        const baseRoles: ColumnRole[] = [
            {text: translate('workspace.companyCards.addNewCard.csvColumns.ignore'), value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
            {text: translate('workspace.companyCards.addNewCard.csvColumns.cardNumber'), value: CONST.CSV_IMPORT_COLUMNS.CARD_NUMBER, isRequired: true},
            {text: translate('workspace.companyCards.addNewCard.csvColumns.postedDate'), value: CONST.CSV_IMPORT_COLUMNS.POSTED_DATE, isRequired: true},
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

        const missingRequiredColumns = requiredColumns
            .filter((requiredColumn) => !columns.includes(requiredColumn.value))
            .map((requiredColumn) => requiredColumn.text)
            .join(', ');
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

        if (!layoutName) {
            return;
        }

        const columnMappings = columnNames.map((_, index) => spreadsheet?.columns?.[index] ?? CONST.CSV_IMPORT_COLUMNS.IGNORE);

        // Transform columns-based data to rows-based data, including the header
        const columns = spreadsheet?.data ?? [];
        const rows: string[][] = [];
        if (columns.length > 0) {
            for (let rowIndex = 0; rowIndex < columns[0].length; rowIndex++) {
                const row: string[] = [];
                for (let colIndex = 0; colIndex < columns.length; colIndex++) {
                    row.push(columns[colIndex][rowIndex] ?? '');
                }
                rows.push(row);
            }
        }
        setIsImportingTransactions(true);
        importCSVCompanyCards({
            policyID,
            workspaceAccountID,
            layoutName,
            layoutType,
            columnMappings,
            csvData: rows,
            containsHeader: spreadsheet?.containsHeader ?? true,
            existingCardsList,
            lastSelectedFeed: lastSelectedFeed ?? undefined,
            workspaceCardFeeds,
        });
    }, [
        validate,
        layoutName,
        columnNames,
        spreadsheet?.columns,
        spreadsheet?.data,
        spreadsheet?.containsHeader,
        policyID,
        layoutType,
        workspaceAccountID,
        existingCardsList,
        lastSelectedFeed,
        workspaceCardFeeds,
    ]);

    if (!spreadsheet && isLoadingOnyxValue(spreadsheetMetadata)) {
        return;
    }

    const spreadsheetColumns = spreadsheet?.data;
    if (!spreadsheetColumns) {
        return <NotFoundPage />;
    }

    const closeImportPageAndModal = () => {
        setIsImportingTransactions(false);
        Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
    };

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
                    isButtonLoading={isImportingTransactions}
                />
                <ImportSpreadsheetConfirmModal
                    isVisible={spreadsheet?.shouldFinalModalBeOpened ?? false}
                    closeImportPageAndModal={closeImportPageAndModal}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CompanyCardsImportedPage.displayName = 'CompanyCardsImportedPage';

export default CompanyCardsImportedPage;
