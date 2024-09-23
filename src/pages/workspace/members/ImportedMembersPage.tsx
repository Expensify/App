import React, {useCallback, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ColumnRole} from '@components/ImportColumn';
import ImportSpreadsheetColumns from '@components/ImportSpreadsheetColumns';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import {closeImportPage} from '@libs/actions/ImportSpreadsheet';
import {importPolicyMembers} from '@libs/actions/Policy/Member';
import {findDuplicate, generateColumnNames} from '@libs/importSpreadsheetUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ImportedMembersPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBERS_IMPORTED>;

function ImportedMembersPage({route}: ImportedMembersPageProps) {
    const {translate} = useLocalize();
    const [spreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const [isImporting, setIsImporting] = useState(false);
    const [isValidationEnabled, setIsValidationEnabled] = useState(false);
    const policyID = route.params.policyID;
    const columnNames = generateColumnNames(spreadsheet?.data?.length ?? 0);
    const {containsHeader = true} = spreadsheet ?? {};

    const columnRoles: ColumnRole[] = [
        {text: translate('common.ignore'), value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
        {text: translate('common.email'), value: CONST.CSV_IMPORT_COLUMNS.EMAIL, isRequired: true},
        {text: translate('common.role'), value: CONST.CSV_IMPORT_COLUMNS.ROLE},
    ];

    const requiredColumns = columnRoles.filter((role) => role.isRequired).map((role) => role);

    // checks if all required columns are mapped and no column is mapped more than once
    // returns found errors or empty object if both conditions are met
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

    const importMembers = useCallback(() => {
        setIsValidationEnabled(true);

        const errors = validate();
        if (Object.keys(errors).length > 0) {
            return;
        }

        const columns = Object.values(spreadsheet?.columns ?? {});
        const membersEmailsColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.EMAIL);
        const membersRolesColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.ROLE);
        const membersEmails = spreadsheet?.data[membersEmailsColumn].map((email) => email);
        const membersRoles = membersRolesColumn !== -1 ? spreadsheet?.data[membersRolesColumn].map((role) => role) : [];
        const members = membersEmails?.slice(containsHeader ? 1 : 0).map((email, index) => {
            let role: string = CONST.POLICY.ROLE.USER;
            if (membersRolesColumn !== -1 && membersRoles?.[containsHeader ? index + 1 : index]) {
                role = membersRoles?.[containsHeader ? index + 1 : index];
            }

            return {
                email,
                role,
            };
        });

        if (members) {
            setIsImporting(true);
            importPolicyMembers(policyID, members);
        }
    }, [validate, spreadsheet, containsHeader, policyID]);

    const spreadsheetColumns = spreadsheet?.data;
    if (!spreadsheetColumns) {
        return;
    }

    const closeImportPageAndModal = () => {
        setIsImporting(false);
        closeImportPage();
        Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
    };

    return (
        <ScreenWrapper
            testID={ImportedMembersPage.displayName}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton
                title={translate('workspace.people.importMembers')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_MEMBERS_IMPORT.getRoute(policyID))}
            />
            <ImportSpreadsheetColumns
                spreadsheetColumns={spreadsheetColumns}
                columnNames={columnNames}
                importFunction={importMembers}
                errors={isValidationEnabled ? validate() : undefined}
                columnRoles={columnRoles}
                isButtonLoading={isImporting}
                learnMoreLink={CONST.IMPORT_SPREADSHEET.MEMBERS_ARTICLE_LINK}
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

ImportedMembersPage.displayName = 'ImportedMembersPage';

export default ImportedMembersPage;
