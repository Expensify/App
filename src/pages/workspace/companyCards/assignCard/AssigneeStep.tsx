import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useInitialSelection from '@hooks/useInitialSelection';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftInviteAccountID} from '@libs/actions/Card';
import {searchUserInServer} from '@libs/actions/Report';
import {getCardAssignmentDateOption, getCardAssignmentStartDate, getDefaultCardName} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {getHeaderMessage} from '@libs/PersonalDetailOptionsListUtils';
import {canMemberWrite, filterGuideAndAccountManager, getGuideAndAccountManagerInfo, getIneligibleInvitees, isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import Navigation from '@navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {setAssignCardStepAndData} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {AssignCardData} from '@src/types/onyx/AssignCard';

import {Str} from 'expensify-common';
import React, {useEffect, useMemo, useState} from 'react';
import {Keyboard} from 'react-native';

type AssigneeStepProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE>;

type AssigneeListItem = ListItem & {
    value: string;
};

function AssigneeStep({route}: AssigneeStepProps) {
    const policyID = route.params.policyID;
    const feed = route.params.feed;
    const cardID = route.params.cardID;
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const policy = usePolicy(policyID);
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const employeePersonalDetails = usePersonalDetailsByLogins([...Object.keys(policy?.employeeList ?? {})]);
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    // Seed the selection from the already-assigned cardholder (e.g. when returning to this step in edit mode) so
    // Next continues with the saved cardholder instead of demanding a fresh selection. Matches CardSelectionStep.
    const [selectedAssignee, setSelectedAssignee] = useState<ListItem | undefined>(() => {
        const assignedEmail = assignCard?.cardToAssign?.email;
        if (!assignedEmail) {
            return undefined;
        }
        return {
            login: assignedEmail,
            accountID: employeePersonalDetails[assignedEmail]?.accountID,
            keyForList: assignedEmail,
        };
    });
    const [shouldShowError, setShouldShowError] = useState(false);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const canInviteMembers = canMemberWrite(policy, session?.email ?? '', CONST.POLICY.POLICY_FEATURE.MEMBERS);

    const ineligibleInvites = getIneligibleInvitees(policy?.employeeList);
    const excludedUsers: Record<string, boolean> = {};
    for (const login of ineligibleInvites) {
        excludedUsers[login] = true;
    }

    const {
        assignedGuideEmail,
        accountManagerLogin,
        exclusions: softExclusions,
    } = useMemo(() => getGuideAndAccountManagerInfo(policy, account?.accountManagerAccountID, personalDetails), [policy, account?.accountManagerAccountID, personalDetails]);

    const {searchTerm, setSearchTerm, debouncedSearchTerm, availableOptions, areOptionsInitialized} = usePersonalDetailSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        includeUserToInvite: canInviteMembers,
        excludeLogins: excludedUsers,
        excludeFromSuggestionsOnly: softExclusions,
        includeRecentReports: canInviteMembers,
        shouldInitialize: didScreenTransitionEnd,
    });

    const isEditing = assignCard?.isEditing;
    // Freeze the assignee selected when the list opened so it can be pinned to the top of long member lists.
    const initialAssigneeEmail = useInitialSelection(assignCard?.cardToAssign?.email, {resetOnFocus: true});

    const submit = (assignee: ListItem) => {
        const personalDetail = employeePersonalDetails[assignee?.login ?? ''];
        const memberName = personalDetail?.firstName ? personalDetail.firstName : Str.removeSMSDomain(personalDetail?.login ?? '');
        const defaultCardName = getDefaultCardName(memberName);
        // Keep the name the user manually typed in CardNameStep. Otherwise always recompute it from the currently selected assignee.
        const customCardName = assignCard?.cardToAssign?.isCustomCardNameEdited ? (assignCard?.cardToAssign?.customCardName ?? defaultCardName) : defaultCardName;
        const cardToAssign: Partial<AssignCardData> = {
            email: assignee?.login ?? '',
            customCardName,
        };

        Keyboard.dismiss();

        const routeParams = {policyID, feed, cardID};

        if (assignee?.login === assignCard?.cardToAssign?.email) {
            if (assignCard?.cardToAssign?.encryptedCardNumber) {
                cardToAssign.encryptedCardNumber = assignCard.cardToAssign.encryptedCardNumber;
                cardToAssign.cardName = assignCard.cardToAssign.cardName;
                // Preserve any start date the user already picked based on the saved data rather than `isEditing`.
                // `isEditing` is false on the header-back-then-Next round trip, so keying off it here would wipe the
                // chosen date. In a fresh flow `startDate`/`dateOption` are undefined, so both helpers still fall back
                // to today/CUSTOM.
                cardToAssign.startDate = getCardAssignmentStartDate(true, assignCard?.cardToAssign?.startDate);
                cardToAssign.dateOption = getCardAssignmentDateOption(true, assignCard?.cardToAssign?.dateOption);
                setAssignCardStepAndData({
                    cardToAssign,
                    isEditing: false,
                });
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION.path));
                return;
            }
            setAssignCardStepAndData({
                cardToAssign,
                isEditing: false,
            });
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CARD_SELECTION.getRoute(routeParams));
            return;
        }

        if (!policy?.employeeList?.[assignee?.login ?? '']) {
            if (!canInviteMembers) {
                return;
            }
            setAssignCardStepAndData({
                cardToAssign: {
                    invitingMemberEmail: assignee?.login ?? '',
                    invitingMemberAccountID: assignee?.accountID ?? undefined,
                },
            });
            setDraftInviteAccountID(assignee?.login ?? '', assignee?.accountID ?? undefined, policyID);
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_INVITE_NEW_MEMBER.getRoute(routeParams));
            return;
        }

        if (assignCard?.cardToAssign?.encryptedCardNumber) {
            cardToAssign.encryptedCardNumber = assignCard.cardToAssign.encryptedCardNumber;
            cardToAssign.cardName = assignCard.cardToAssign.cardName;
            // Preserve the saved start date based on the data, not `isEditing` (see the matching branch above).
            cardToAssign.startDate = getCardAssignmentStartDate(true, assignCard?.cardToAssign?.startDate);
            cardToAssign.dateOption = getCardAssignmentDateOption(true, assignCard?.cardToAssign?.dateOption);
            setAssignCardStepAndData({
                cardToAssign,
                isEditing: false,
            });
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION.path));
            return;
        }
        setAssignCardStepAndData({
            cardToAssign,
            isEditing: false,
        });
        Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CARD_SELECTION.getRoute(routeParams));
    };

    const selectAssignee = (assignee: ListItem) => {
        setSelectedAssignee(assignee);
        setShouldShowError(false);
    };

    const assignSelectedCardholder = () => {
        if (!selectedAssignee) {
            setShouldShowError(true);
            return;
        }
        submit(selectedAssignee);
    };

    const handleBackButtonPress = () => {
        // When editing the cardholder from the Confirmation step, the assignee step is the only screen left in the RHP
        // stack, so a bare goBack() would dismiss the whole modal. Navigate back to Confirmation explicitly instead
        // (mirroring CardSelectionStep). Plain wizard back-navigation (isEditing false) falls through to goBack().
        if (isEditing) {
            setAssignCardStepAndData({
                isEditing: false,
            });
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION.path));
            return;
        }
        Navigation.goBack();
    };

    const membersDetails: AssigneeListItem[] = [];
    if (policy?.employeeList) {
        for (const [email, policyEmployee] of Object.entries(policy.employeeList ?? {})) {
            if (isDeletedPolicyEmployee(policyEmployee, isOffline)) {
                continue;
            }

            const personalDetail = employeePersonalDetails[email];
            membersDetails.push({
                keyForList: email,
                text: personalDetail?.displayName,
                alternateText: email,
                login: email,
                value: email,
                accountID: personalDetail?.accountID,
                isSelected: selectedAssignee?.login === email,
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

        sortAlphabetically(membersDetails, 'text', localeCompare);
    }

    // Pin the currently-assigned member to the top of the full member list, then reuse the pinned list for both
    // the base list and the search source below so it stays pinned while searching (when it still matches).
    // moveInitialSelectionToTop no-ops for lists under the search-box threshold.
    const orderedMembersDetails = moveInitialSelectionToTop(membersDetails, initialAssigneeEmail ? [initialAssigneeEmail] : []);
    let assignees: ListItem[] = filterGuideAndAccountManager(orderedMembersDetails, assignedGuideEmail, accountManagerLogin);
    if (debouncedSearchTerm && areOptionsInitialized) {
        const searchValueForOptions = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();
        const filteredMembers = filterGuideAndAccountManager(orderedMembersDetails, assignedGuideEmail, accountManagerLogin);
        const filteredOptions = tokenizedSearch(filteredMembers, searchValueForOptions, (option) => [option.text ?? '', option.alternateText ?? '']);

        const options = canInviteMembers
            ? [
                  ...filteredOptions,
                  ...availableOptions.selectedOptions,
                  ...availableOptions.recentOptions,
                  ...availableOptions.personalDetails,
                  ...(availableOptions.userToInvite ? [availableOptions.userToInvite] : []),
              ]
            : filteredOptions;

        assignees = options.map((option) => ({
            ...option,
            keyForList: option.keyForList ?? option.login ?? '',
            isSelected: !!selectedAssignee?.login && selectedAssignee.login === option.login,
        }));
    } else if (debouncedSearchTerm) {
        assignees = [];
    }

    useEffect(() => {
        if (!canInviteMembers) {
            return;
        }

        searchUserInServer(debouncedSearchTerm);
    }, [canInviteMembers, debouncedSearchTerm]);

    const searchValue = debouncedSearchTerm.trim().toLowerCase();
    const headerMessage = (() => {
        if (assignees.length > 0) {
            return '';
        }
        if (CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        return getHeaderMessage(translate, searchValue, countryCode);
    })();

    const textInputOptions = {
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        value: searchTerm,
        onChangeText: setSearchTerm,
        headerMessage,
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <InteractiveStepWrapper
                wrapperID="AssigneeStep"
                handleBackButtonPress={handleBackButtonPress}
                headerTitle={translate('workspace.companyCards.assignCard')}
                enableEdgeToEdgeBottomSafeAreaPadding
                onEntryTransitionEnd={() => setDidScreenTransitionEnd(true)}
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.chooseTheCardholder')}</Text>
                <SelectionList
                    // Reset the list instance when the frozen selection changes on re-entry, so returning via the back
                    // button remounts the list scrolled to the top with the selected assignee pinned and visible.
                    key={initialAssigneeEmail ?? ''}
                    data={assignees}
                    onSelectRow={selectAssignee}
                    ListItem={UserListItem}
                    textInputOptions={textInputOptions}
                    initiallyFocusedItemKey={selectedAssignee?.keyForList}
                    shouldScrollToFocusedIndexOnMount={false}
                    shouldShowLoadingPlaceholder={!areOptionsInitialized}
                    isLoadingNewOptions={canInviteMembers && !!isSearchingForReports}
                    disableMaintainingScrollPosition
                    shouldUpdateFocusedIndex
                    addBottomSafeAreaPadding
                    footerContent={
                        <FormAlertWithSubmitButton
                            buttonText={translate('common.next')}
                            onSubmit={assignSelectedCardholder}
                            isAlertVisible={shouldShowError}
                            containerStyles={[!shouldShowError && styles.mt5]}
                            message={translate('workspace.companyCards.pleaseSelectACardholder')}
                            shouldShowLoadingImmediatelyOnPress={false}
                            // Selecting a cardholder is a local-state-only step (no network call), so Next must stay
                            // usable offline. Without this the button is force-disabled offline (regression #97426).
                            enabledWhenOffline
                        />
                    }
                />
            </InteractiveStepWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default AssigneeStep;
