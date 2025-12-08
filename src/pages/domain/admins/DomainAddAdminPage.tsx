import React, {useCallback, useMemo, useState} from 'react';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import { FallbackAvatar } from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type { ListItem } from '@components/SelectionListWithSections/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import { getLatestErrorMessageField } from '@libs/ErrorUtils';
import { isOffline } from '@libs/Network/NetworkStore';
import { getDisplayNameOrDefault } from '@libs/PersonalDetailsUtils';
import { getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type { PlatformStackScreenProps } from '@navigation/PlatformStackNavigation/types';
import type { DomainSplitNavigatorParamList } from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import { isEmptyObject } from '@src/types/utils/EmptyObject';


type DomainAddAdminPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.SAML>;

type MemberOption = Omit<ListItem, 'accountID' | 'login'> & {
    accountID: number;
    login: string;
    customField1?: string;
    customField2?: string;
};

function DomainAddAdminPage({route}: DomainAddAdminPageProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();

    const accountID = route.params.accountID;
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {canBeMissing: true});
    const [isAdmin] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_ADMIN_ACCESS}${accountID}`, {canBeMissing: false});

    const [searchValue, setSearchValue] = useState('');
    const [selectedAccountID, setSelectedAccountID] = useState<number | null>(null);

    const fakeID = '15EDF503224FEB58';
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${fakeID}`, {canBeMissing: false});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});

    const isOfflineAndNoMemberDataAvailable = isEmptyObject(policy?.employeeList) && isOffline;

    const policyMemberEmailsToAccountIDs = useMemo(() => getMemberAccountIDsForWorkspace(policy?.employeeList, true), [policy?.employeeList]);


    const data: MemberOption[] = useMemo(() => {
        const result: MemberOption[] = [];
        for (const [email, policyEmployee] of Object.entries(policy?.employeeList ?? {})) {
            const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? '');
            const details = personalDetails?.[accountID];

            const isSelected = selectedAccountID === accountID;

            result.push({
                keyForList: details.login ?? '',
                accountID,
                isSelected,
                login: details.login ?? '',
                customField1: policyEmployee.employeeUserID,
                customField2: policyEmployee.employeePayrollID,
                isInteractive: !details.isOptimisticPersonalDetail,
                cursorStyle: details.isOptimisticPersonalDetail ? styles.cursorDefault : {},
                text: formatPhoneNumber(getDisplayNameOrDefault(details)),
                alternateText: formatPhoneNumber(details?.login ?? ''),
                icons: [
                    {
                        source: details.avatar ?? FallbackAvatar,
                        name: formatPhoneNumber(details?.login ?? ''),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
                errors: getLatestErrorMessageField(policyEmployee),
                pendingAction: policyEmployee.pendingAction,
            });
        }
        return result;
    }, [formatPhoneNumber, personalDetails, policy?.employeeList, policyMemberEmailsToAccountIDs, selectedAccountID, styles.cursorDefault]);

    // const inviteUser = useCallback(() => {
    //     const errors: Errors = {};
    //     if (selectedOptions.length <= 0) {
    //         errors.noUserSelected = 'true';
    //     }
    //
    //     setWorkspaceErrors(route.params.policyID, errors);
    //     const isValid = isEmptyObject(errors);
    //
    //     if (!isValid) {
    //         return;
    //     }
    //     HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);
    //
    //     const invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs = {};
    //     for (const option of selectedOptions) {
    //         const login = option.login ?? '';
    //         const accountID = option.accountID ?? CONST.DEFAULT_NUMBER_ID;
    //         if (!login.toLowerCase().trim() || !accountID) {
    //             continue;
    //         }
    //         invitedEmailsToAccountIDs[login] = Number(accountID);
    //     }
    //     setWorkspaceInviteMembersDraft(route.params.policyID, invitedEmailsToAccountIDs);
    //     Navigation.navigate(ROUTES.WORKSPACE_INVITE_MESSAGE.getRoute(route.params.policyID, Navigation.getActiveRoute()));
    // }, [route.params.policyID, selectedOptions]);

    const footerContent = useMemo(
        () => (
            <FormAlertWithSubmitButton
                isDisabled={!selectedAccountID}
                isAlertVisible={false}
                buttonText={translate('common.invite')}
                onSubmit={() => {}}
                message={policy?.alertMessage ?? ''}
                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                enabledWhenOffline
            />
        ),
        [policy?.alertMessage, selectedAccountID, styles.flexBasisAuto, styles.flexGrow0, styles.flexReset, styles.flexShrink0, translate],
    );

    const onSelect = useCallback(
        (option: UserListItem) => {
            setSelectedAccountID(option.accountID);
        },
        [],
    );

    return (
        <ScreenWrapper
            testID={DomainAddAdminPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                title={translate('domain.domainAdmins.addAdmin')}
                onBackButtonPress={Navigation.goBack}
            />
            <SelectionList
                data={data}
                ListItem={UserListItem}
                onSelectRow={onSelect}
                canSelectMultiple={false}
                footerContent={footerContent}
                textInputOptions={{
                    shouldBeInsideList: true,
                    value: searchValue,
                    onChangeText: setSearchValue,
                    label: translate('common.email'),
                    inputMode: 'email'
                }}
            />

        </ScreenWrapper>
    );
}

DomainAddAdminPage.displayName = 'DomainAddAdminPage';

export default DomainAddAdminPage;
