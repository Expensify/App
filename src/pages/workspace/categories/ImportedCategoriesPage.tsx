import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import type {ColumnRole} from '@components/ImportColumn';
import ImportSpreadsheetColumns from '@components/ImportSpreadsheetColumns';
import ScreenWrapper from '@components/ScreenWrapper';

import useCloseImportPage from '@hooks/useCloseImportPage';
import useImportSpreadsheetConfirmModal from '@hooks/useImportSpreadsheetConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';

import {importPolicyCategories} from '@libs/actions/Policy/Category';
import {buildCategoriesFromSpreadsheet} from '@libs/ImportCategoriesUtils';
import {findDuplicate, generateColumnNames} from '@libs/importSpreadsheetUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {arePolicyRulesEnabled, hasAccountingConnections as hasAccountingConnectionsPolicyUtils, isControlPolicy} from '@libs/PolicyUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {RouteProp} from '@react-navigation/native';

import React, {useCallback, useState} from 'react';

type ImportedCategoriesPageProps = {
    route: RouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORIES_IMPORTED | typeof SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORTED>;
};
function ImportedCategoriesPage({route}: ImportedCategoriesPageProps) {
    const {translate} = useLocalize();
    const [spreadsheet, spreadsheetMetadata] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const [isImportingCategories, setIsImportingCategories] = useState(false);
    const {containsHeader = true} = spreadsheet ?? {};
    const [isValidationEnabled, setIsValidationEnabled] = useState(false);
    const policyID = route.params.policyID;
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    const {setIsClosing} = useCloseImportPage();
    const showImportSpreadsheetConfirmModal = useImportSpreadsheetConfirmModal();

    const policy = usePolicy(policyID);
    const columnNames = generateColumnNames(spreadsheet?.data?.length ?? 0);
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORTED;
    const backTo = isQuickSettingsFlow && 'backTo' in route.params ? route.params.backTo : undefined;
    const workspaceImportPath = createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CATEGORIES_IMPORT.path, ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID));

    const getColumnRoles = (): ColumnRole[] => {
        const roles = [];
        roles.push(
            {text: translate('common.ignore'), value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
            {text: translate('common.name'), value: CONST.CSV_IMPORT_COLUMNS.NAME, isRequired: true},
            {text: translate('common.enabled'), value: CONST.CSV_IMPORT_COLUMNS.ENABLED},
        );

        if (isControlPolicy(policy)) {
            roles.push(
                {text: translate('workspace.categories.glCode'), value: CONST.CSV_IMPORT_COLUMNS.GL_CODE},
                {text: translate('workspace.categories.payrollCode'), value: CONST.CSV_IMPORT_COLUMNS.PAYROLL_CODE},
                {text: translate('workspace.rules.categoryRules.requireReceiptsOver'), value: CONST.CSV_IMPORT_COLUMNS.MAX_AMOUNT_NO_RECEIPT},
                {text: translate('workspace.rules.categoryRules.requireItemizedReceiptsOver'), value: CONST.CSV_IMPORT_COLUMNS.MAX_AMOUNT_NO_ITEMIZED_RECEIPT},
            );
        }

        if (arePolicyRulesEnabled(policy, policyCategories)) {
            roles.push(
                {text: translate('workspace.rules.categoryRules.requireDescription'), value: CONST.CSV_IMPORT_COLUMNS.ARE_COMMENTS_REQUIRED},
                {text: translate('workspace.rules.categoryRules.descriptionHint'), value: CONST.CSV_IMPORT_COLUMNS.COMMENT_HINT},
                {text: translate('workspace.rules.categoryRules.flagAmountsOver'), value: CONST.CSV_IMPORT_COLUMNS.MAX_EXPENSE_AMOUNT},
                {text: translate('workspace.rules.categoryRules.expenseLimitType'), value: CONST.CSV_IMPORT_COLUMNS.EXPENSE_LIMIT_TYPE},
            );
        }

        return roles;
    };

    const columnRoles = getColumnRoles();

    const requiredColumns = columnRoles.filter((role) => role.isRequired).map((role) => role);

    const validate = useCallback(() => {
        const columns = Object.values(spreadsheet?.columns ?? {});
        let errors: Errors = {};

        const missingRequiredColumns = requiredColumns.find((requiredColumn) => !columns.includes(requiredColumn.value));
        if (missingRequiredColumns) {
            errors.required = translate('spreadsheet.fieldNotMapped', missingRequiredColumns.text);
        } else {
            const duplicate = findDuplicate(columns);
            const duplicateColumn = columnRoles.find((role) => role.value === duplicate);

            const categoriesNamesColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.NAME);
            const categoriesNames = categoriesNamesColumn !== -1 ? spreadsheet?.data[categoriesNamesColumn] : [];
            const containsEmptyName = categoriesNames?.some((name, index) => (!containsHeader || index > 0) && !name?.toString().trim());

            if (duplicateColumn) {
                errors.duplicates = translate('spreadsheet.singleFieldMultipleColumns', duplicateColumn.text);
            } else if (containsEmptyName) {
                errors.emptyNames = translate('spreadsheet.emptyMappedField', translate('common.name'));
            } else {
                errors = {};
            }
        }
        return errors;
    }, [spreadsheet?.columns, spreadsheet?.data, requiredColumns, translate, columnRoles, containsHeader]);

    const closeImportPageAndModal = () => {
        setIsClosing(true);
        setIsImportingCategories(false);
        Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(policyID, backTo) : ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID));
    };

    const importCategories = async () => {
        setIsValidationEnabled(true);
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            return;
        }

        const categories = buildCategoriesFromSpreadsheet(spreadsheet, policyCategories);

        if (categories) {
            setIsImportingCategories(true);
            const importFinalModal = await importPolicyCategories(policyID, categories, policyCategories);
            const didShowImportFinalModal = await showImportSpreadsheetConfirmModal(importFinalModal, {shouldHandleNavigationBack: false});
            if (!didShowImportFinalModal) {
                setIsImportingCategories(false);
                return;
            }
            closeImportPageAndModal();
        }
    };

    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    if (!spreadsheet && isLoadingOnyxValue(spreadsheetMetadata)) {
        return;
    }

    const spreadsheetColumns = spreadsheet?.data;

    if (hasAccountingConnections || !spreadsheetColumns) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID="ImportedCategoriesPage"
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButtonAndTitle
                title={translate('workspace.categories.importCategories')}
                onBackButtonPress={() => Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORIES_IMPORT.getRoute(policyID, backTo) : workspaceImportPath)}
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
        </ScreenWrapper>
    );
}

export default ImportedCategoriesPage;
