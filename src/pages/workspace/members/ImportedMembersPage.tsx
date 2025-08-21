import React, {useCallback, useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ColumnRole} from '@components/ImportColumn';
import ImportSpreadsheetColumns from '@components/ImportSpreadsheetColumns';
import ScreenWrapper from '@components/ScreenWrapper';
import useCloseImportPage from '@hooks/useCloseImportPage';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {importPolicyMembers, setImportedSpreadsheetMemberData} from '@libs/actions/Policy/Member';
import {findDuplicate, generateColumnNames} from '@libs/importSpreadsheetUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isPolicyMemberWithoutPendingDelete} from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type ImportedMembersPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBERS_IMPORTED>;

function ImportedMembersPage({route}: ImportedMembersPageProps) {
    const {translate} = useLocalize();
    const [spreadsheet, spreadsheetMetadata] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET, {canBeMissing: true});
    const [isImporting, setIsImporting] = useState(false);
    const [isValidationEnabled, setIsValidationEnabled] = useState(false);
    const {setIsClosing} = useCloseImportPage();

    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);

    const columnNames = generateColumnNames(spreadsheet?.data?.length ?? 0);
    const {containsHeader = true} = spreadsheet ?? {};

    const columnRoles: ColumnRole[] = [
        {text: translate('common.ignore'), value: CONST.CSV_IMPORT_COLUMNS.IGNORE},
        {text: translate('common.email'), value: CONST.CSV_IMPORT_COLUMNS.EMAIL, isRequired: true},
        {text: translate('common.role'), value: CONST.CSV_IMPORT_COLUMNS.ROLE},
        {text: translate('common.submitTo'), value: CONST.CSV_IMPORT_COLUMNS.SUBMIT_TO},
        {text: translate('common.forwardTo'), value: CONST.CSV_IMPORT_COLUMNS.APPROVE_TO},
    ];

    const requiredColumns = columnRoles.filter((role) => role.isRequired).map((role) => role);

    // checks if all required columns are mapped and no column is mapped more than once
    // returns found errors or empty object if both conditions are met
    const validate = useCallback(() => {
        const columns = Object.values(spreadsheet?.columns ?? {});
        let errors: Record<string, string | null> = {};
        const missingRequiredColumns = requiredColumns.find((requiredColumn) => !columns.includes(requiredColumn.value));
        if (missingRequiredColumns) {
            errors.required = translate('spreadsheet.fieldNotMapped', {fieldName: missingRequiredColumns.text});
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

    const importMembers = useCallback(() => {
        setIsValidationEnabled(true);

        const errors = validate();
        if (Object.keys(errors).length > 0) {
            return;
        }

        let isRoleMissing = false;

        const columns = Object.values(spreadsheet?.columns ?? {});
        const membersEmailsColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.EMAIL);
        const membersRolesColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.ROLE);
        const membersEmails = spreadsheet?.data[membersEmailsColumn].map((email) => email);
        const membersRoles = membersRolesColumn !== -1 ? spreadsheet?.data[membersRolesColumn].map((role) => role) : [];
        const membersSubmitsToColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.SUBMIT_TO);
        const membersForwardsToColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.APPROVE_TO);
        const membersSubmitsTo = membersSubmitsToColumn !== -1 ? spreadsheet?.data[membersSubmitsToColumn].map((submitsTo) => submitsTo) : [];
        const membersForwardsTo = membersForwardsToColumn !== -1 ? spreadsheet?.data[membersForwardsToColumn].map((forwardsTo) => forwardsTo) : [];
        const members = membersEmails?.slice(containsHeader ? 1 : 0).map((email, index) => {
            const isPolicyMember = isPolicyMemberWithoutPendingDelete(email, policy);
            let role = isPolicyMember ? (policy?.employeeList?.[email]?.role ?? '') : '';
            if (membersRolesColumn !== -1 && membersRoles?.[containsHeader ? index + 1 : index]) {
                role = membersRoles?.[containsHeader ? index + 1 : index];
            }
            if (membersRolesColumn !== -1 && !role) {
                isRoleMissing = true;
            }
            let submitsTo = '';
            if (membersSubmitsToColumn !== -1 && membersSubmitsTo?.[containsHeader ? index + 1 : index]) {
                submitsTo = membersSubmitsTo?.[containsHeader ? index + 1 : index];
            }
            let forwardsTo = '';
            if (membersForwardsToColumn !== -1 && membersForwardsTo?.[containsHeader ? index + 1 : index]) {
                forwardsTo = membersForwardsTo?.[containsHeader ? index + 1 : index];
            }

            return {
                email,
                role,
                submitsTo,
                forwardsTo,
            };
        });

        const allMembers = [...(members ?? [])];

        // Add submitsTo and forwardsTo members if they are not in the workspace
        members?.forEach((member) => {
            if (member.submitsTo && !allMembers.some((m) => m.email === member.submitsTo) && !isPolicyMemberWithoutPendingDelete(member.submitsTo, policy)) {
                isRoleMissing = true;
                allMembers.push({
                    email: member.submitsTo,
                    role: '',
                    submitsTo: '',
                    forwardsTo: '',
                });
            }

            if (member.forwardsTo && !allMembers.some((m) => m.email === member.forwardsTo) && !isPolicyMemberWithoutPendingDelete(member.forwardsTo, policy)) {
                isRoleMissing = true;
                allMembers.push({
                    email: member.forwardsTo,
                    role: policy?.employeeList?.[member.forwardsTo]?.role ?? '',
                    submitsTo: '',
                    forwardsTo: '',
                });
            }
        });

        if (isRoleMissing) {
            setImportedSpreadsheetMemberData(allMembers);
            Navigation.navigate(ROUTES.WORKSPACE_MEMBERS_IMPORTED_CONFIRMATION.getRoute(policyID));
        } else {
            setIsImporting(true);
            importPolicyMembers(policyID, allMembers);
        }
    }, [validate, spreadsheet?.columns, spreadsheet?.data, containsHeader, policy, policyID]);

    if (!spreadsheet && isLoadingOnyxValue(spreadsheetMetadata)) {
        return;
    }

    const spreadsheetColumns = spreadsheet?.data;
    if (!spreadsheetColumns) {
        return <NotFoundPage />;
    }

    const closeImportPageAndModal = () => {
        setIsClosing(true);
        setIsImporting(false);
        Navigation.goBack(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
    };

    return (
        <ScreenWrapper
            testID={ImportedMembersPage.displayName}
            enableEdgeToEdgeBottomSafeAreaPadding
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
                shouldHandleNavigationBack
            />
        </ScreenWrapper>
    );
}

ImportedMembersPage.displayName = 'ImportedMembersPage';

export default ImportedMembersPage;
