import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ColumnRole} from '@components/ImportColumn';
import ImportSpreadsheetColumns from '@components/ImportSpreadsheetColumns';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import {closeImportPage} from '@libs/actions/ImportSpreadsheet';
import {importPolicyCategories} from '@libs/actions/Policy/Category';
import {findDuplicate, generateColumnNames} from '@libs/importSpreadsheetUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isControlPolicy} from '@libs/PolicyUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type ImportedCategoriesPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES_IMPORTED>;
function ImportedCategoriesPage({route}: ImportedCategoriesPageProps) {
    const {translate} = useLocalize();
    const [spreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const [isImportingCategories, setIsImportingCategories] = useState(false);
    const {containsHeader = true} = spreadsheet ?? {};
    const [isValidationEnabled, setIsValidationEnabled] = useState(false);
    const policyID = route.params.policyID;
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const policy = usePolicy(policyID);
    const columnNames = generateColumnNames(spreadsheet?.data?.length ?? 0);

    const getColumnRoles = (): ColumnRole[] => {
        const roles = [];
        roles.push(
            {text: translate('common.ignore'), value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
            {text: translate('common.name'), value: CONST.CSV_IMPORT_COLUMNS.NAME, isRequired: true},
            {text: translate('common.enabled'), value: CONST.CSV_IMPORT_COLUMNS.ENABLED, isRequired: true},
        );

        if (isControlPolicy(policy)) {
            roles.push({text: translate('workspace.categories.glCode'), value: CONST.CSV_IMPORT_COLUMNS.GL_CODE});
        }

        return roles;
    };

    const columnRoles = getColumnRoles();

    const requiredColumns = columnRoles.filter((role) => role.isRequired).map((role) => role);
    const validate = useCallback(() => {
        const columns = Object.values(spreadsheet?.columns ?? {});
        let errors: Errors = {};

        if (!requiredColumns.every((requiredColumn) => columns.includes(requiredColumn.value))) {
            // eslint-disable-next-line rulesdir/prefer-early-return
            requiredColumns.forEach((requiredColumn) => {
                if (!columns.includes(requiredColumn.value)) {
                    errors.required = translate('spreadsheet.fieldNotMapped', requiredColumn.text);
                }
            });
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
    }, [requiredColumns, spreadsheet?.columns, translate, columnRoles]);

    const importCategories = useCallback(() => {
        setIsValidationEnabled(true);
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            return;
        }

        const columns = Object.values(spreadsheet?.columns ?? {});
        const categoriesNamesColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.NAME);
        const categoriesGLCodeColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.GL_CODE);
        const categoriesEnabledColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.ENABLED);
        const categoriesNames = spreadsheet?.data[categoriesNamesColumn].map((name) => name);
        const categoriesEnabled = categoriesEnabledColumn !== -1 ? spreadsheet?.data[categoriesEnabledColumn].map((enabled) => enabled) : [];
        const categoriesGLCode = categoriesGLCodeColumn !== -1 ? spreadsheet?.data[categoriesGLCodeColumn].map((glCode) => glCode) : [];
        const categories = categoriesNames?.slice(containsHeader ? 1 : 0).map((name, index) => {
            const categoryAlreadyExists = policyCategories?.[name];
            const existingGLCodeOrDefault = categoryAlreadyExists?.['GL Code'] ?? '';
            return {
                name,
                enabled: categoriesEnabledColumn !== -1 ? categoriesEnabled?.[containsHeader ? index + 1 : index] === 'true' : true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'GL Code': categoriesGLCodeColumn !== -1 ? categoriesGLCode?.[containsHeader ? index + 1 : index] ?? '' : existingGLCodeOrDefault,
            };
        });

        if (categories) {
            setIsImportingCategories(true);
            importPolicyCategories(policyID, categories);
        }
    }, [validate, spreadsheet, containsHeader, policyID, policyCategories]);

    const hasAccountingConnections = PolicyUtils.hasAccountingConnections(policy);
    if (hasAccountingConnections) {
        return <NotFoundPage />;
    }

    const spreadsheetColumns = spreadsheet?.data;
    if (!spreadsheetColumns) {
        return;
    }

    const closeImportPageAndModal = () => {
        setIsImportingCategories(false);
        closeImportPage();
        Navigation.navigate(ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID));
    };

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
                columnNames={columnNames}
                importFunction={importCategories}
                errors={isValidationEnabled ? validate() : undefined}
                columnRoles={columnRoles}
                isButtonLoading={isImportingCategories}
                learnMoreLink={CONST.IMPORT_SPREADSHEET.CATEGORIES_ARTICLE_LINK}
            />

            <ConfirmModal
                isVisible={spreadsheet?.shouldFinalModalBeOpened}
                title={spreadsheet?.importFinalModal?.title ?? ''}
                prompt={spreadsheet?.importFinalModal?.prompt ?? ''}
                onConfirm={closeImportPageAndModal}
                onCancel={closeImportPageAndModal}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
        </ScreenWrapper>
    );
}

ImportedCategoriesPage.displayName = 'ImportedCategoriesPage';

export default ImportedCategoriesPage;
