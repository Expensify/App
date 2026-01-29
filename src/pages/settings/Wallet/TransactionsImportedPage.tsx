import React, {useCallback, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ColumnRole} from '@components/ImportColumn';
import ImportSpreadsheetColumns from '@components/ImportSpreadsheetColumns';
import ImportSpreadsheetConfirmModal from '@components/ImportSpreadsheetConfirmModal';
import ScreenWrapper from '@components/ScreenWrapper';
import useCloseImportPage from '@hooks/useCloseImportPage';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import importTransactionsFromCSV from '@libs/actions/ImportTransactions';
import {findDuplicate, generateColumnNames} from '@libs/importSpreadsheetUtils';
import Navigation from '@libs/Navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function TransactionsImportedPage() {
    const {translate} = useLocalize();
    const [spreadsheet, spreadsheetMetadata] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET, {canBeMissing: true});
    const [isImporting, setIsImporting] = useState(false);
    const [isValidationEnabled, setIsValidationEnabled] = useState(false);

    const {setIsClosing} = useCloseImportPage();

    const columnNames = generateColumnNames(spreadsheet?.data?.length ?? 0);

    const columnRoles: ColumnRole[] = [
        {text: translate('common.ignore'), value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
        {text: translate('common.date'), value: 'date', isRequired: true},
        {text: translate('common.merchant'), value: 'merchant'},
        {text: translate('common.category'), value: 'category'},
        {text: translate('iou.amount'), value: 'amount', isRequired: true},
    ];

    const requiredColumns = columnRoles.filter((role) => role.isRequired);

    const validate = useCallback(() => {
        const columns = Object.values(spreadsheet?.columns ?? {});
        let errors: Errors = {};

        const missingRequiredColumns = requiredColumns.find((requiredColumn) => !columns.includes(requiredColumn.value));
        if (missingRequiredColumns) {
            errors.required = translate('spreadsheet.fieldNotMapped', missingRequiredColumns.text);
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
    }, [spreadsheet?.columns, requiredColumns, translate, columnRoles]);

    const importTransactions = useCallback(() => {
        setIsValidationEnabled(true);
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            return;
        }

        if (!spreadsheet) {
            return;
        }

        setIsImporting(true);
        importTransactionsFromCSV(spreadsheet);
    }, [validate, spreadsheet]);

    if (!spreadsheet && isLoadingOnyxValue(spreadsheetMetadata)) {
        return null;
    }

    const spreadsheetColumns = spreadsheet?.data;

    if (!spreadsheetColumns) {
        return <NotFoundPage />;
    }

    const closeImportPageAndModal = () => {
        setIsClosing(true);
        setIsImporting(false);
        Navigation.goBack(ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS);
    };

    return (
        <ScreenWrapper
            testID="TransactionsImportedPage"
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.importTransactions.title')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET_IMPORT_TRANSACTIONS_SPREADSHEET.getRoute())}
            />
            <ImportSpreadsheetColumns
                spreadsheetColumns={spreadsheetColumns}
                columnNames={columnNames}
                importFunction={importTransactions}
                errors={isValidationEnabled ? validate() : undefined}
                columnRoles={columnRoles}
                isButtonLoading={isImporting}
            />

            <ImportSpreadsheetConfirmModal
                isVisible={spreadsheet?.shouldFinalModalBeOpened}
                closeImportPageAndModal={closeImportPageAndModal}
                shouldHandleNavigationBack={false}
            />
        </ScreenWrapper>
    );
}

TransactionsImportedPage.displayName = 'TransactionsImportedPage';

export default TransactionsImportedPage;
