import React, {useCallback, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ColumnRole} from '@components/ImportColumn';
import ImportSpreadsheetColumns from '@components/ImportSpreadsheetColumns';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import {closeImportPage} from '@libs/actions/ImportSpreadsheet';
import {importPolicyTags} from '@libs/actions/Policy/Tag';
import {findDuplicate, generateColumnNames} from '@libs/importSpreadsheetUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getTagLists, isControlPolicy} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type ImportedTagsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS_IMPORTED>;

function ImportedTagsPage({route}: ImportedTagsPageProps) {
    const {translate} = useLocalize();
    const [spreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const [isImportingTags, setIsImportingTags] = useState(false);
    const {containsHeader = true} = spreadsheet ?? {};
    const [isValidationEnabled, setIsValidationEnabled] = useState(false);
    const policyID = route.params.policyID;
    const backTo = route.params.backTo;
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const policyTagLists = useMemo(() => getTagLists(policyTags), [policyTags]);
    const policy = usePolicy(policyID);
    const columnNames = generateColumnNames(spreadsheet?.data?.length ?? 0);
    const isQuickSettingsFlow = !!backTo;

    const getColumnRoles = (): ColumnRole[] => {
        const roles = [];
        roles.push(
            {text: translate('common.ignore'), value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
            {text: translate('common.name'), value: CONST.CSV_IMPORT_COLUMNS.NAME, isRequired: true},
            {text: translate('common.enabled'), value: CONST.CSV_IMPORT_COLUMNS.ENABLED, isRequired: true},
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

        if (!requiredColumns.every((requiredColumn) => columns.includes(requiredColumn.value))) {
            // eslint-disable-next-line rulesdir/prefer-early-return
            requiredColumns.forEach((requiredColumn) => {
                if (!columns.includes(requiredColumn.value)) {
                    errors.required = translate('spreadsheet.fieldNotMapped', {fieldName: requiredColumn.text});
                }
            });
        } else {
            const duplicate = findDuplicate(columns);
            if (duplicate) {
                errors.duplicates = translate('spreadsheet.singleFieldMultipleColumns', {fieldName: duplicate});
            } else {
                errors = {};
            }
        }
        return errors;
    }, [requiredColumns, spreadsheet?.columns, translate]);

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
                'GL Code': tagsGLCodeColumn !== -1 ? tagsGLCode?.[containsHeader ? index + 1 : index] ?? '' : existingGLCodeOrDefault,
            };
        });

        if (tags) {
            setIsImportingTags(true);
            importPolicyTags(policyID, tags);
        }
    }, [validate, spreadsheet, containsHeader, policyTagLists, policyID]);

    const spreadsheetColumns = spreadsheet?.data;
    if (!spreadsheetColumns) {
        return;
    }

    const closeImportPageAndModal = () => {
        setIsImportingTags(false);
        closeImportPage();
        Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo) : ROUTES.WORKSPACE_TAGS.getRoute(policyID));
    };

    return (
        <ScreenWrapper
            testID={ImportedTagsPage.displayName}
            includeSafeAreaPaddingBottom
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

ImportedTagsPage.displayName = 'ImportedTagsPage';

export default ImportedTagsPage;
