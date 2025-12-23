import React, {useCallback, useMemo, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ColumnRole} from '@components/ImportColumn';
import ImportSpreadsheetColumns from '@components/ImportSpreadsheetColumns';
import ImportSpreadsheetConfirmModal from '@components/ImportSpreadsheetConfirmModal';
import ScreenWrapper from '@components/ScreenWrapper';
import useCloseImportPage from '@hooks/useCloseImportPage';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {importPolicyTags} from '@libs/actions/Policy/Tag';
import {findDuplicate, generateColumnNames} from '@libs/importSpreadsheetUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getTagLists, isControlPolicy} from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type ImportedTagsPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS_IMPORTED>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_IMPORTED>;

function ImportedTagsPage({route}: ImportedTagsPageProps) {
    const {translate} = useLocalize();
    const [spreadsheet, spreadsheetMetadata] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET, {canBeMissing: true});
    const [isImportingTags, setIsImportingTags] = useState(false);
    const {containsHeader = true} = spreadsheet ?? {};
    const [isValidationEnabled, setIsValidationEnabled] = useState(false);
    const policyID = route.params.policyID;
    const backTo = route.params.backTo;
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const policyTagLists = useMemo(() => getTagLists(policyTags), [policyTags]);
    const policy = usePolicy(policyID);
    const columnNames = generateColumnNames(spreadsheet?.data?.length ?? 0);
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_IMPORTED;

    const {setIsClosing} = useCloseImportPage();

    const getColumnRoles = (): ColumnRole[] => {
        const roles = [];
        roles.push(
            {text: translate('common.ignore'), value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
            {text: translate('common.name'), value: CONST.CSV_IMPORT_COLUMNS.NAME, isRequired: true},
            {text: translate('common.enabled'), value: CONST.CSV_IMPORT_COLUMNS.ENABLED},
        );

        if (isControlPolicy(policy)) {
            roles.push({text: translate('workspace.tags.glCode'), value: CONST.CSV_IMPORT_COLUMNS.GL_CODE});
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
            errors.required = translate('spreadsheet.fieldNotMapped', {fieldName: missingRequiredColumns.text});
        } else {
            const duplicate = findDuplicate(columns);
            const tagsNamesColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.NAME);
            const tagsNames = tagsNamesColumn !== -1 ? spreadsheet?.data[tagsNamesColumn] : [];
            const containsEmptyName = tagsNames?.some((name, index) => (!containsHeader || index > 0) && !name?.toString().trim());

            if (duplicate) {
                errors.duplicates = translate('spreadsheet.singleFieldMultipleColumns', {fieldName: duplicate});
            } else if (containsEmptyName) {
                errors.emptyNames = translate('spreadsheet.emptyMappedField', {fieldName: translate('common.name')});
            } else {
                errors = {};
            }
        }
        return errors;
    }, [requiredColumns, spreadsheet?.columns, translate, containsHeader, spreadsheet?.data]);

    const importTags = useCallback(() => {
        setIsValidationEnabled(true);
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            return;
        }

        const columns = Object.values(spreadsheet?.columns ?? {});
        const tagsNamesColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.NAME);
        const tagsGLCodeColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.GL_CODE);
        const tagsEnabledColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.ENABLED);
        const tagsNames = spreadsheet?.data[tagsNamesColumn].map((name) => name);
        const tagsEnabled = tagsEnabledColumn !== -1 ? spreadsheet?.data[tagsEnabledColumn].map((enabled) => enabled) : [];
        const tagsGLCode = tagsGLCodeColumn !== -1 ? spreadsheet?.data[tagsGLCodeColumn].map((glCode) => glCode) : [];
        const tags = tagsNames?.slice(containsHeader ? 1 : 0).map((name, index) => {
            // Right now we support only single-level tags, this check should be updated when we add multi-level support
            const tagAlreadyExists = policyTagLists.at(0)?.tags?.[name];
            const existingGLCodeOrDefault = tagAlreadyExists?.['GL Code'] ?? '';
            return {
                name,
                enabled: tagsEnabledColumn !== -1 ? tagsEnabled?.[containsHeader ? index + 1 : index] === 'true' : true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'GL Code': tagsGLCodeColumn !== -1 ? (tagsGLCode?.[containsHeader ? index + 1 : index] ?? '') : existingGLCodeOrDefault,
            };
        });

        if (tags) {
            setIsImportingTags(true);
            importPolicyTags(policyID, tags);
        }
    }, [validate, spreadsheet, containsHeader, policyTagLists, policyID]);

    if (!spreadsheet && isLoadingOnyxValue(spreadsheetMetadata)) {
        return;
    }

    const spreadsheetColumns = spreadsheet?.data;
    if (!spreadsheetColumns) {
        return <NotFoundPage />;
    }

    const closeImportPageAndModal = () => {
        setIsClosing(true);
        setIsImportingTags(false);
        Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo) : ROUTES.WORKSPACE_TAGS.getRoute(policyID));
    };

    return (
        <ScreenWrapper
            testID="ImportedTagsPage"
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('workspace.tags.importTags')}
                onBackButtonPress={() => Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_TAGS_IMPORT.getRoute(policyID, backTo) : ROUTES.WORKSPACE_TAGS_IMPORT.getRoute(policyID))}
            />
            <ImportSpreadsheetColumns
                spreadsheetColumns={spreadsheetColumns}
                columnNames={columnNames}
                importFunction={importTags}
                errors={isValidationEnabled ? validate() : undefined}
                columnRoles={columnRoles}
                isButtonLoading={isImportingTags}
                learnMoreLink={CONST.IMPORT_SPREADSHEET.TAGS_ARTICLE_LINK}
            />

            <ImportSpreadsheetConfirmModal
                isVisible={spreadsheet?.shouldFinalModalBeOpened}
                closeImportPageAndModal={closeImportPageAndModal}
            />
        </ScreenWrapper>
    );
}

export default ImportedTagsPage;
