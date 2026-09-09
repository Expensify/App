import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import Text from '@components/Text';

import useDebouncedState from '@hooks/useDebouncedState';
import useInitialSelection from '@hooks/useInitialSelection';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {changePolicyUberBillingAccount} from '@libs/actions/Policy/Policy';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {formatMemberForList, getHeaderMessage, getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import type {MemberForList} from '@libs/OptionsListUtils';
import {isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React, {useState} from 'react';

type ChangeReceiptBillingAccountPagePageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS_CHANGE_BILLING_ACCOUNT>;

type BillingAccountMemberItem = MemberForList & {
    value: string;
};

function ChangeReceiptBillingAccountPage({route}: ChangeReceiptBillingAccountPagePageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const {isOffline} = useNetwork();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedOptionState, setSelectedOption] = useState<string | undefined>(undefined);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);

    const policyID = route.params?.policyID;
    const integration = route.params?.integration;
    const policy = usePolicy(policyID);
    const employeePersonalDetails = usePersonalDetailsByLogins(Object.keys(policy?.employeeList ?? {}));
    const integrations = policy?.receiptPartners;
    const centralBillingAccountEmail = integration ? integrations?.[integration]?.centralBillingAccountEmail : undefined;
    const selectedOption = selectedOptionState ?? centralBillingAccountEmail ?? '';
    // Freeze the billing account that was selected when the page opened so it stays pinned to the top for the whole open/focus cycle.
    const initialBillingAccountEmail = useInitialSelection(selectedOption, {resetOnFocus: true});

    const shouldShowTextInput = policy?.employeeList && Object.keys(policy.employeeList).length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const textInputLabel = shouldShowTextInput ? translate('common.search') : undefined;
    let workspaceMembers: BillingAccountMemberItem[] = [];
    if (policy?.employeeList) {
        for (const [email, policyEmployee] of Object.entries(policy.employeeList)) {
            if (isDeletedPolicyEmployee(policyEmployee, isOffline)) {
                continue;
            }

            const personalDetail = employeePersonalDetails[email ?? ''];
            if (personalDetail) {
                const memberForList = formatMemberForList({
                    text: personalDetail?.displayName ?? email,
                    alternateText: email,
                    login: email,
                    accountID: personalDetail?.accountID,
                    icons: [
                        {
                            source: personalDetail?.avatar ?? icons.FallbackAvatar,
                            name: formatPhoneNumber(email),
                            type: CONST.ICON_TYPE_AVATAR,
                            id: personalDetail?.accountID,
                        },
                    ],
                    reportID: '',
                    keyForList: email,
                    isSelected: email === selectedOption || personalDetail?.login === selectedOption,
                });

                workspaceMembers.push({...memberForList, value: email});
            }
        }

        workspaceMembers = sortAlphabetically(workspaceMembers, 'text', localeCompare);
    }

    // Pin the frozen initial billing account to the top of the full sorted list before search filtering, so it keeps its top spot while searching (search filters the already-pinned list rather than reordering it).
    const orderedWorkspaceMembers = moveInitialSelectionToTop(workspaceMembers, initialBillingAccountEmail ? [initialBillingAccountEmail] : []);

    let data = orderedWorkspaceMembers;
    if (debouncedSearchTerm && orderedWorkspaceMembers.length > 0) {
        const searchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();
        data = tokenizedSearch(orderedWorkspaceMembers, searchValue, (option) => [option.text ?? '', option.alternateText ?? '']);
    } else if (orderedWorkspaceMembers.length === 0) {
        data = [];
    }

    const toggleOption = (option: MemberForList) => {
        if (!centralBillingAccountEmail) {
            return;
        }
        setSelectedOption(option.login);

        changePolicyUberBillingAccount(policyID, option.login, centralBillingAccountEmail);
        Navigation.goBack();
    };

    const searchValue = debouncedSearchTerm.trim().toLowerCase();
    const headerMessage = getHeaderMessage(data.length !== 0, false, searchValue, countryCode);

    const textInputOptions = {
        label: textInputLabel,
        value: searchTerm,
        onChangeText: setSearchTerm,
        headerMessage,
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED}
        >
            <ScreenWrapper testID="ChangeReceiptBillingAccountPage">
                <HeaderWithBackButton title={translate('workspace.receiptPartners.uber.centralBillingAccount')} />
                <Text style={[styles.ph5, styles.pb3]}>{translate('workspace.receiptPartners.uber.centralBillingDescription')}</Text>
                <SelectionList
                    data={data}
                    onSelectRow={toggleOption}
                    ListItem={InviteMemberListItem}
                    textInputOptions={textInputOptions}
                    shouldShowTextInput={shouldShowTextInput}
                    initiallyFocusedItemKey={initialBillingAccountEmail}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    disableMaintainingScrollPosition
                    shouldUpdateFocusedIndex
                    addBottomSafeAreaPadding
                    showScrollIndicator
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default ChangeReceiptBillingAccountPage;
