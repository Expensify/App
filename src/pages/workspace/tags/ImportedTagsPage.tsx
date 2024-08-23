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
import {importPolicyTags} from '@libs/actions/Policy/Tag';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isControlPolicy} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ImportedTagsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS_IMPORTED>;

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

function ImportedTagsPage({route}: ImportedTagsPageProps) {
    const {translate} = useLocalize();
    const [spreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const [isImporting, setIsImporting] = useState(false);
    const [containsHeader, setContainsHeader] = useState(false);
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const columnNames = generateColumnNames(spreadsheet?.data?.length ?? 0);

    const isControl = isControlPolicy(policy);

    const getColumnRoles = (): ColumnRole[] => {
        const roles = [];
        roles.push(
            {text: translate('common.ignore'), value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
            {text: translate('common.name'), value: CONST.CSV_IMPORT_COLUMNS.NAME, isRequired: true},
            {text: translate('common.enabled'), value: CONST.CSV_IMPORT_COLUMNS.ENABLED, isRequired: true},
        );

        if (isControl) {
            roles.push({text: translate('workspace.tags.glCode'), value: CONST.CSV_IMPORT_COLUMNS.GL_CODE, isRequired: true});
        }

        return roles;
    };

    const columnRoles = getColumnRoles();

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

    const importTags = useCallback(() => {
        validate();
        const columns = Object.values(spreadsheet?.columns ?? {});
        const tagsNamesColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.NAME);
        const tagsGLCodeColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.GL_CODE);
        const tagsEnabledColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.ENABLED);
        const tagsNames = spreadsheet?.data[tagsNamesColumn].map((name) => name);
        const tagsEnabled = tagsEnabledColumn !== -1 ? spreadsheet?.data[tagsEnabledColumn].map((enabled) => enabled) : [];
        const tagsGLCode = tagsGLCodeColumn !== -1 ? spreadsheet?.data[tagsGLCodeColumn].map((glCode) => glCode) : [];
        const tags = tagsNames?.slice(containsHeader ? 1 : 0).map((name, index) => ({
            name,
            enabled: tagsEnabledColumn !== -1 ? tagsEnabled?.[containsHeader ? index + 1 : index] === 'true' : true,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'GL Code': tagsGLCodeColumn !== -1 ? tagsGLCode?.[containsHeader ? index + 1 : index] : '',
        }));

        if (tags) {
            setIsImporting(true);
            importPolicyTags(policyID, tags);
        }
    }, [validate, spreadsheet, containsHeader, policyID]);

    const spreadsheetColumns = spreadsheet?.data;
    if (!spreadsheetColumns) {
        return;
    }

    return (
        <ScreenWrapper
            testID={ImportedTagsPage.displayName}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton
                title={translate('workspace.tags.importTags')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_TAGS_IMPORT.getRoute(policyID))}
            />
            <ImportSpreadsheetColumns
                spreadsheetColumns={spreadsheetColumns}
                containsHeader={containsHeader}
                setContainsHeader={setContainsHeader}
                columnNames={columnNames}
                importFunction={importTags}
                errors={validate()}
                columnRoles={columnRoles}
                isButtonLoading={isImporting}
                headerText={translate('workspace.tags.importedTagsMessage', spreadsheetColumns?.length)}
            />

            <ConfirmModal
                isVisible={spreadsheet?.shouldFinalModalBeOpened}
                title={spreadsheet?.importFinalModal?.title ?? ''}
                prompt={spreadsheet?.importFinalModal?.prompt ?? ''}
                onConfirm={() => {
                    setIsImporting(false);
                    closeImportPage();
                    Navigation.navigate(ROUTES.WORKSPACE_TAGS.getRoute(policyID));
                }}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
        </ScreenWrapper>
    );
}

ImportedTagsPage.displayName = 'ImportedTagsPage';

export default ImportedTagsPage;
