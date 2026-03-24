import React, {useCallback, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ColumnRole} from '@components/ImportColumn';
import ImportSpreadsheetColumns from '@components/ImportSpreadsheetColumns';
import ImportSpreadsheetConfirmModal from '@components/ImportSpreadsheetConfirmModal';
import ScreenWrapper from '@components/ScreenWrapper';
import useCloseImportPage from '@hooks/useCloseImportPage';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {importPolicyCategories} from '@libs/actions/Policy/Category';
import {findDuplicate, generateColumnNames} from '@libs/importSpreadsheetUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {hasAccountingConnections as hasAccountingConnectionsPolicyUtils, isControlPolicy} from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type ImportedCategoriesPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES_IMPORTED>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORTED>;
function ImportedCategoriesPage({route}: ImportedCategoriesPageProps) {
    const {translate} = useLocalize();
    const [spreadsheet, spreadsheetMetadata] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const [isImportingCategories, setIsImportingCategories] = useState(false);
    const {containsHeader = true} = spreadsheet ?? {};
    const [isValidationEnabled, setIsValidationEnabled] = useState(false);
    const policyID = route.params.policyID;
    const backTo = route.params.backTo;
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    const {setIsClosing} = useCloseImportPage();

    const policy = usePolicy(policyID);
    const columnNames = generateColumnNames(spreadsheet?.data?.length ?? 0);
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORTED;

    const getColumnRoles = (): ColumnRole[] => {
        const roles = [];
        roles.push(
            {text: translate('common.ignore'), value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
            {text: translate('common.name'), value: CONST.CSV_IMPORT_COLUMNS.NAME, isRequired: true},
            {text: translate('common.enabled'), value: CONST.CSV_IMPORT_COLUMNS.ENABLED},
        );

        if (isControlPolicy(policy)) {
            roles.push({text: translate('workspace.categories.glCode'), value: CONST.CSV_IMPORT_COLUMNS.GL_CODE});
            roles.push({text: translate('workspace.rules.categoryRules.requireReceiptsOver'), value: CONST.CSV_IMPORT_COLUMNS.MAX_AMOUNT_NO_RECEIPT});
            roles.push({text: translate('workspace.rules.categoryRules.requireItemizedReceiptsOver'), value: CONST.CSV_IMPORT_COLUMNS.MAX_AMOUNT_NO_ITEMIZED_RECEIPT});
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
        const categoriesMaxAmountNoReceiptColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.MAX_AMOUNT_NO_RECEIPT);
        const categoriesMaxAmountNoItemizedReceiptColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.MAX_AMOUNT_NO_ITEMIZED_RECEIPT);
        const categoriesNames = spreadsheet?.data[categoriesNamesColumn].map((name) => name);
        const categoriesEnabled = categoriesEnabledColumn !== -1 ? spreadsheet?.data[categoriesEnabledColumn].map((enabled) => enabled) : [];
        const categoriesGLCode = categoriesGLCodeColumn !== -1 ? spreadsheet?.data[categoriesGLCodeColumn].map((glCode) => glCode) : [];
        const categoriesMaxAmountNoReceipt = categoriesMaxAmountNoReceiptColumn !== -1 ? spreadsheet?.data[categoriesMaxAmountNoReceiptColumn].map((val) => val) : [];
        const categoriesMaxAmountNoItemizedReceipt = categoriesMaxAmountNoItemizedReceiptColumn !== -1 ? spreadsheet?.data[categoriesMaxAmountNoItemizedReceiptColumn].map((val) => val) : [];

        const parseCsvReceiptValue = (raw: string | undefined): number | undefined => {
            if (!raw?.trim()) {
                return undefined;
            }
            const val = raw.trim().toLowerCase();
            if (['required', 'always', '0'].includes(val)) {
                return 0;
            }
            if (['not_required', 'never'].includes(val)) {
                return CONST.DISABLED_MAX_EXPENSE_VALUE;
            }
            const n = Number(val);
            return Number.isFinite(n) ? n : undefined;
        };

        const categories = categoriesNames?.slice(containsHeader ? 1 : 0).map((name, index) => {
            const categoryAlreadyExists = policyCategories?.[name];
            const existingGLCodeOrDefault = categoryAlreadyExists?.['GL Code'] ?? '';
            const dataIndex = containsHeader ? index + 1 : index;

            const parsedMaxAmountNoReceipt = categoriesMaxAmountNoReceiptColumn !== -1 ? parseCsvReceiptValue(categoriesMaxAmountNoReceipt?.[dataIndex] as string | undefined) : undefined;
            const parsedMaxAmountNoItemizedReceipt =
                categoriesMaxAmountNoItemizedReceiptColumn !== -1 ? parseCsvReceiptValue(categoriesMaxAmountNoItemizedReceipt?.[dataIndex] as string | undefined) : undefined;

            // Apply normalization: if receipts are not required, itemized receipts must also be not required
            let normalizedMaxAmountNoReceipt = parsedMaxAmountNoReceipt;
            let normalizedMaxAmountNoItemizedReceipt = parsedMaxAmountNoItemizedReceipt;
            if (parsedMaxAmountNoReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE) {
                normalizedMaxAmountNoItemizedReceipt = CONST.DISABLED_MAX_EXPENSE_VALUE;
            } else if (parsedMaxAmountNoItemizedReceipt === 0) {
                normalizedMaxAmountNoReceipt = 0;
            }

            return {
                name,
                enabled: categoriesEnabledColumn !== -1 ? categoriesEnabled?.[dataIndex] === 'true' : true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'GL Code': categoriesGLCodeColumn !== -1 ? (categoriesGLCode?.[dataIndex] ?? '') : existingGLCodeOrDefault,
                ...(normalizedMaxAmountNoReceipt !== undefined && {maxAmountNoReceipt: normalizedMaxAmountNoReceipt}),
                ...(normalizedMaxAmountNoItemizedReceipt !== undefined && {maxAmountNoItemizedReceipt: normalizedMaxAmountNoItemizedReceipt}),
            };
        });

        if (categories) {
            setIsImportingCategories(true);
            importPolicyCategories(policyID, categories);
        }
    }, [validate, spreadsheet, containsHeader, policyID, policyCategories]);

    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    if (!spreadsheet && isLoadingOnyxValue(spreadsheetMetadata)) {
        return;
    }

    const spreadsheetColumns = spreadsheet?.data;

    if (hasAccountingConnections || !spreadsheetColumns) {
        return <NotFoundPage />;
    }

    const closeImportPageAndModal = () => {
        setIsClosing(true);
        setIsImportingCategories(false);
        Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(policyID, backTo) : ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID));
    };

    return (
        <ScreenWrapper
            testID="ImportedCategoriesPage"
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('workspace.categories.importCategories')}
                onBackButtonPress={() =>
                    Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORIES_IMPORT.getRoute(policyID, backTo) : ROUTES.WORKSPACE_CATEGORIES_IMPORT.getRoute(policyID))
                }
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

            <ImportSpreadsheetConfirmModal
                isVisible={spreadsheet?.shouldFinalModalBeOpened}
                closeImportPageAndModal={closeImportPageAndModal}
                shouldHandleNavigationBack={false}
            />
        </ScreenWrapper>
    );
}

export default ImportedCategoriesPage;
