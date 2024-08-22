import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ColumnRole} from '@components/ImportColumn';
import ImportSpreadsheetColumns from '@components/ImportSpreadsheetColumns';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import {closeImportPage} from '@libs/actions/ImportSpreadsheet';
import {importPolicyCategories} from '@libs/actions/Policy/Category';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ImportedCategoriesPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES_IMPORTED>;

function numberToColumn(index: number) {
    let column = '';
    let number = index;
    while (number >= 0) {
        column = String.fromCharCode((number % 26) + 65) + column;
        number = Math.floor(number / 26) - 1;
    }
    return column;
}

function generateColumnNames(length: number) {
    return Array.from({length}, (_, i) => numberToColumn(i));
}

function findDuplicate(array: string[]): string | null {
    const frequencyCounter: Record<string, number> = {};

    for (const item of array) {
        if (item !== CONST.CSV_IMPORT_COLUMNS.IGNORE) {
            if (frequencyCounter[item]) {
                return item;
            }
            frequencyCounter[item] = (frequencyCounter[item] || 0) + 1;
        }
    }

    return null;
}

function ImportedCategoriesPage({route}: ImportedCategoriesPageProps) {
    const {translate} = useLocalize();
    const [spreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const [isImportingCategories, setIsImportingCategories] = useState(false);
    const [containsHeader, setContainsHeader] = useState(false);
    const policyID = route.params.policyID;
    const columnNames = generateColumnNames(spreadsheet?.data?.length ?? 0);

    const columnRoles: ColumnRole[] = [
        {text: translate('common.ignore'), value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
        {text: translate('common.name'), value: CONST.CSV_IMPORT_COLUMNS.NAME, isRequired: true},
        {text: translate('common.enabled'), value: CONST.CSV_IMPORT_COLUMNS.ENABLED, isRequired: true},
    ];

    const requiredColumns = columnRoles.filter((role) => role.isRequired).map((role) => role);

    const validate = useCallback(() => {
        const columns = Object.values(spreadsheet?.columns ?? {});
        let errors: Record<string, string | null> = {};

        if (!requiredColumns.every((requiredColumn) => columns.includes(requiredColumn.value))) {
            // eslint-disable-next-line rulesdir/prefer-early-return
            requiredColumns.forEach((requiredColumn) => {
                if (!columns.includes(requiredColumn.value)) {
                    errors.required = translate('spreadsheet.fieldNotMapped', requiredColumn.text);
                }
            });
        } else {
            const duplicate = findDuplicate(columns);
            if (duplicate) {
                errors.duplicates = translate('spreadsheet.singleFieldMultipleColumns', duplicate);
            } else {
                errors = {};
            }
        }

        return errors;
    }, [requiredColumns, spreadsheet?.columns, translate]);

    const importCategories = useCallback(() => {
        validate();
        const columns = Object.values(spreadsheet?.columns ?? {});
        const categoriesNamesColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.NAME);
        const categoriesEnabledColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.ENABLED);
        const categoriesNames = spreadsheet?.data[categoriesNamesColumn].map((name) => name);
        const categoriesEnabled = categoriesEnabledColumn !== -1 ? spreadsheet?.data[categoriesEnabledColumn].map((enabled) => enabled) : [];
        const categories = categoriesNames?.slice(containsHeader ? 1 : 0).map((name, index) => ({
            name,
            enabled: categoriesEnabledColumn !== -1 ? categoriesEnabled?.[containsHeader ? index + 1 : index] === 'true' : true,
        }));

        if (categories) {
            setIsImportingCategories(true);
            importPolicyCategories(policyID, categories);
        }
    }, [validate, spreadsheet, containsHeader, policyID]);

    const spreadsheetColumns = spreadsheet?.data;
    if (!spreadsheetColumns) {
        return;
    }

    return (
        <ScreenWrapper
            testID={ImportedCategoriesPage.displayName}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton
                title={translate('workspace.categories.importCategories')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORIES_IMPORT.getRoute(policyID))}
            />
            <ImportSpreadsheetColumns
                spreadsheetColumns={spreadsheetColumns}
                containsHeader={containsHeader}
                setContainsHeader={setContainsHeader}
                columnNames={columnNames}
                importFunction={importCategories}
                errors={validate()}
                columnRoles={columnRoles}
                isButtonLoading={isImportingCategories}
            />

            <ConfirmModal
                isVisible={spreadsheet?.shouldFinalModalBeOpened}
                title={spreadsheet?.importFinalModal?.title ?? ''}
                prompt={spreadsheet?.importFinalModal?.prompt ?? ''}
                onConfirm={() => {
                    setIsImportingCategories(false);
                    closeImportPage();
                    Navigation.navigate(ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID));
                }}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
        </ScreenWrapper>
    );
}

ImportedCategoriesPage.displayName = 'ImportedCategoriesPage';

export default ImportedCategoriesPage;
