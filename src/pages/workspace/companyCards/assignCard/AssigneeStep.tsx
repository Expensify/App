import React, {useEffect, useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {setDraftInviteAccountID} from '@libs/actions/Card';
import {searchInServer} from '@libs/actions/Report';
import {getDefaultCardName, getFilteredCardList, hasOnlyOneCardToAssign} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getHeaderMessage, getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getIneligibleInvitees, isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import Navigation from '@navigation/Navigation';
import {useAssignCardNavigation} from '@pages/workspace/companyCards/utils';
import {setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';
import type {AssignCardData, AssignCardStep} from '@src/types/onyx/AssignCard';

type AssigneeStepProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE>;

function AssigneeStep({route}: AssigneeStepProps) {
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar'] as const);
    const {isOffline} = useNetwork();
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: false});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const policyID = route.params?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const feed = decodeURIComponent(route.params?.feed) as CompanyCardFeedWithDomainID;
    const [list] = useCardsList(feed);
    const [cardFeeds] = useCardFeeds(policy?.id);
    const filteredCardList = getFilteredCardList(list, cardFeeds?.[feed]?.accountList, workspaceCardFeeds);
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});

    useAssignCardNavigation(policyID, feed);

    const excludedUsers = useMemo(() => {
        const ineligibleInvites = getIneligibleInvitees(policy?.employeeList);
        return ineligibleInvites.reduce(
            (acc, login) => {
                acc[login] = true;
                return acc;
            },
            {} as Record<string, boolean>,
        );
    }, [policy?.employeeList]);

    const {searchTerm, setSearchTerm, debouncedSearchTerm, availableOptions, selectedOptionsForDisplay, areOptionsInitialized} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
        includeUserToInvite: true,
        excludeLogins: excludedUsers,
        includeRecentReports: true,
        shouldInitialize: didScreenTransitionEnd,
    });

    const isEditing = assignCard?.isEditing;

    const submit = (assignee: ListItem) => {
        let nextStep: AssignCardStep = CONST.COMPANY_CARD.STEP.CARD;
        const personalDetail = getPersonalDetailByEmail(assignee?.login ?? '');
        const memberName = personalDetail?.firstName ? personalDetail.firstName : personalDetail?.login;
        const data: Partial<AssignCardData> = {
            email: assignee?.login ?? '',
            cardName: getDefaultCardName(memberName),
        };

        Keyboard.dismiss();
        if (assignee?.login === assignCard?.data?.email) {
            setAssignCardStepAndData({
                currentStep: isEditing ? CONST.COMPANY_CARD.STEP.CONFIRMATION : nextStep,
                isEditing: false,
            });
            return;
        }

        if (!policy?.employeeList?.[assignee?.login ?? '']) {
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.INVITE_NEW_MEMBER,
                data: {
                    invitingMemberEmail: assignee?.login ?? '',
                    invitingMemberAccountID: assignee?.accountID ?? undefined,
                },
            });
            setDraftInviteAccountID(assignee?.login ?? '', assignee?.accountID ?? undefined, policyID);
            return;
        }

        if (hasOnlyOneCardToAssign(filteredCardList)) {
            nextStep = CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE;
            data.cardNumber = Object.keys(filteredCardList).at(0);
            data.encryptedCardNumber = Object.values(filteredCardList).at(0);
        }

        setAssignCardStepAndData({
            currentStep: isEditing ? CONST.COMPANY_CARD.STEP.CONFIRMATION : nextStep,
            data,
            isEditing: false,
        });
    };

    const handleBackButtonPress = () => {
        if (isEditing) {
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
                isEditing: false,
            });
            return;
        }
        Navigation.dismissModal();
    };

    const membersDetails = useMemo(() => {
        let membersList: ListItem[] = [];
        if (!policy?.employeeList) {
            return membersList;
        }

        for (const [email, policyEmployee] of Object.entries(policy.employeeList ?? {})) {
            if (isDeletedPolicyEmployee(policyEmployee, isOffline)) {
                continue;
            }

            const personalDetail = getPersonalDetailByEmail(email);
            membersList.push({
                keyForList: email,
                text: personalDetail?.displayName,
                alternateText: email,
                login: email,
                accountID: personalDetail?.accountID,
                isSelected: assignCard?.data?.email === email,
                icons: [
                    {
                        source: personalDetail?.avatar ?? icons.FallbackAvatar,
                        name: formatPhoneNumber(email),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: personalDetail?.accountID,
                    },
                ],
            });
        }

        membersList = sortAlphabetically(membersList, 'text', localeCompare);

        return membersList;
    }, [isOffline, policy?.employeeList, assignCard?.data?.email, formatPhoneNumber, localeCompare, icons.FallbackAvatar]);

    const assignees = useMemo(() => {
        if (!debouncedSearchTerm) {
            return membersDetails;
        }

        if (!areOptionsInitialized) {
            return [];
        }

        const searchValueForOptions = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();
        const filteredOptions = tokenizedSearch(membersDetails, searchValueForOptions, (option) => [option.text ?? '', option.alternateText ?? '']);

        const options = [
            ...filteredOptions,
            ...selectedOptionsForDisplay,
            ...availableOptions.recentReports,
            ...availableOptions.personalDetails,
            ...(availableOptions.userToInvite ? [availableOptions.userToInvite] : []),
        ];

        return options.map((option) => ({
            ...option,
            keyForList: option.keyForList ?? option.login ?? '',
        }));
    }, [
        areOptionsInitialized,
        availableOptions.personalDetails,
        availableOptions.recentReports,
        availableOptions.userToInvite,
        countryCode,
        debouncedSearchTerm,
        membersDetails,
        selectedOptionsForDisplay,
    ]);

    useEffect(() => {
        searchInServer(searchTerm);
    }, [searchTerm]);

    const headerMessage = useMemo(() => {
        const searchValue = searchTerm.trim().toLowerCase();
        if (!availableOptions.userToInvite && CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        return getHeaderMessage(assignees.length > 0, !!availableOptions.userToInvite, searchValue, countryCode, false);
    }, [searchTerm, availableOptions.userToInvite, assignees?.length, countryCode, translate]);

    const textInputOptions = useMemo(
        () => ({
            label: translate('selectionList.nameEmailOrPhoneNumber'),
            value: searchTerm,
            onChangeText: setSearchTerm,
            headerMessage,
        }),
        [headerMessage, searchTerm, setSearchTerm, translate],
    );

    return (
        <InteractiveStepWrapper
            wrapperID={AssigneeStep.displayName}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={0}
            stepNames={CONST.COMPANY_CARD.STEP_NAMES}
            headerTitle={translate('workspace.companyCards.assignCard')}
            enableEdgeToEdgeBottomSafeAreaPadding
            onEntryTransitionEnd={() => setDidScreenTransitionEnd(true)}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.whoNeedsCardAssigned')}</Text>
            <SelectionList
                data={assignees}
                onSelectRow={submit}
                ListItem={UserListItem}
                textInputOptions={textInputOptions}
                initiallyFocusedItemKey={assignCard?.data?.email}
                showLoadingPlaceholder={!areOptionsInitialized}
                isLoadingNewOptions={!!isSearchingForReports}
                disableMaintainingScrollPosition
                shouldUpdateFocusedIndex
                addBottomSafeAreaPadding
            />
        </InteractiveStepWrapper>
    );
}

AssigneeStep.displayName = 'AssigneeStep';

export default AssigneeStep;
