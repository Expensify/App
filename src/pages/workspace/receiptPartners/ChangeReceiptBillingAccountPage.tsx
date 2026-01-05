import React, {useCallback, useEffect, useMemo, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import Text from '@components/Text';
import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {changePolicyUberBillingAccount} from '@libs/actions/Policy/Policy';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {formatMemberForList, getHeaderMessage, getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import type {MemberForList} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type ChangeReceiptBillingAccountPagePageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS_CHANGE_BILLING_ACCOUNT>;

function ChangeReceiptBillingAccountPage({route}: ChangeReceiptBillingAccountPagePageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar'] as const);

    const policyID = route.params?.policyID;
    const integration = route.params?.integration;
    const policy = usePolicy(policyID);
    const integrations = policy?.receiptPartners;
    const centralBillingAccountEmail = integration ? integrations?.[integration]?.centralBillingAccountEmail : undefined;

    const shouldShowTextInput = policy?.employeeList && Object.keys(policy.employeeList).length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const textInputLabel = shouldShowTextInput ? translate('common.search') : undefined;
    const workspaceMembers = useMemo(() => {
        let membersList: MemberForList[] = [];
        if (!policy?.employeeList) {
            return membersList;
        }

        for (const [email, policyEmployee] of Object.entries(policy.employeeList)) {
            if (isDeletedPolicyEmployee(policyEmployee, isOffline)) {
                continue;
            }

            const personalDetail = getPersonalDetailByEmail(email);
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

                membersList.push(memberForList);
            }
        }

        membersList = sortAlphabetically(membersList, 'text', localeCompare);

        return membersList;
    }, [policy?.employeeList, localeCompare, isOffline, icons.FallbackAvatar, selectedOption]);

    const data = useMemo(() => {
        if (workspaceMembers.length === 0) {
            return [];
        }

        let membersToDisplay = workspaceMembers;

        // Apply search filter if there's a search term
        if (debouncedSearchTerm) {
            const searchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();
            membersToDisplay = tokenizedSearch(workspaceMembers, searchValue, (option) => [option.text ?? '', option.alternateText ?? '']);
        }

        return membersToDisplay;
    }, [workspaceMembers, countryCode, debouncedSearchTerm]);

    useEffect(() => {
        if (!centralBillingAccountEmail) {
            return;
        }
        setSelectedOption(centralBillingAccountEmail);
    }, [centralBillingAccountEmail]);

    const toggleOption = useCallback(
        (option: MemberForList) => {
            if (!centralBillingAccountEmail) {
                return;
            }
            setSelectedOption(option.login);

            changePolicyUberBillingAccount(policyID, option.login, centralBillingAccountEmail);
            Navigation.goBack();
        },
        [policyID, centralBillingAccountEmail],
    );

    const headerMessage = useMemo(() => {
        const searchValue = debouncedSearchTerm.trim().toLowerCase();

        return getHeaderMessage(data.length !== 0, false, searchValue, countryCode);
    }, [debouncedSearchTerm, data.length, countryCode]);

    const textInputOptions = useMemo(
        () => ({
            label: textInputLabel,
            value: searchTerm,
            onChangeText: setSearchTerm,
            headerMessage,
        }),
        [headerMessage, searchTerm, setSearchTerm, textInputLabel],
    );

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
                    initiallyFocusedItemKey={centralBillingAccountEmail}
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
