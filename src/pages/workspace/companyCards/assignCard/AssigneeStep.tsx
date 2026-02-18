import {format} from 'date-fns';
import {Str} from 'expensify-common';
import React, {useEffect, useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {setDraftInviteAccountID} from '@libs/actions/Card';
import {searchInServer} from '@libs/actions/Report';
import {getDefaultCardName} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getHeaderMessage, getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {filterGuideAndAccountManager, getGuideAndAccountManagerInfo, getIneligibleInvitees, isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import Navigation from '@navigation/Navigation';
import {setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {AssignCardData} from '@src/types/onyx/AssignCard';

type AssigneeStepProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE>;

function AssigneeStep({route}: AssigneeStepProps) {
    const policyID = route.params.policyID;
    const feed = route.params.feed;
    const cardID = route.params.cardID;
    const backTo = route.params?.backTo;
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const policy = usePolicy(policyID);
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});

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

    const {searchTerm, setSearchTerm, debouncedSearchTerm, availableOptions, selectedOptionsForDisplay, areOptionsInitialized} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
        includeUserToInvite: true,
        excludeLogins: excludedUsers,
        excludeFromSuggestionsOnly: softExclusions,
        includeRecentReports: true,
        shouldInitialize: didScreenTransitionEnd,
    });

    const isEditing = assignCard?.isEditing;

    const submit = (assignee: ListItem) => {
        const personalDetail = getPersonalDetailByEmail(assignee?.login ?? '');
        const memberName = personalDetail?.firstName ? personalDetail.firstName : Str.removeSMSDomain(personalDetail?.login ?? '');
        const defaultCardName = getDefaultCardName(memberName);
        const cardToAssign: Partial<AssignCardData> = {
            email: assignee?.login ?? '',
            ...(!assignCard?.cardToAssign?.customCardName ? {customCardName: defaultCardName} : {}),
        };

        Keyboard.dismiss();

        const routeParams = {policyID, feed, cardID};

        if (assignee?.login === assignCard?.cardToAssign?.email) {
            if (assignCard?.cardToAssign?.encryptedCardNumber) {
                cardToAssign.encryptedCardNumber = assignCard.cardToAssign.encryptedCardNumber;
                cardToAssign.cardName = assignCard.cardToAssign.cardName;
                cardToAssign.customCardName = assignCard.cardToAssign.customCardName ?? defaultCardName;
                cardToAssign.startDate = !isEditing
                    ? format(new Date(), CONST.DATE.FNS_FORMAT_STRING)
                    : (assignCard?.cardToAssign?.startDate ?? format(new Date(), CONST.DATE.FNS_FORMAT_STRING));
                cardToAssign.dateOption = !isEditing
                    ? CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM
                    : (assignCard?.cardToAssign?.dateOption ?? CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM);
                setAssignCardStepAndData({
                    cardToAssign,
                    isEditing: false,
                });
                Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION.getRoute(routeParams, backTo));
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
            cardToAssign.customCardName = assignCard.cardToAssign.customCardName ?? defaultCardName;
            cardToAssign.startDate = !isEditing
                ? format(new Date(), CONST.DATE.FNS_FORMAT_STRING)
                : (assignCard?.cardToAssign?.startDate ?? format(new Date(), CONST.DATE.FNS_FORMAT_STRING));
            cardToAssign.dateOption = !isEditing
                ? CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM
                : (assignCard?.cardToAssign?.dateOption ?? CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM);
            setAssignCardStepAndData({
                cardToAssign,
                isEditing: false,
            });
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION.getRoute(routeParams, backTo));
            return;
        }
        setAssignCardStepAndData({
            cardToAssign,
            isEditing: false,
        });
        Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CARD_SELECTION.getRoute(routeParams));
    };

    const handleBackButtonPress = () => {
        if (isEditing) {
            setAssignCardStepAndData({
                isEditing: false,
            });
        }
        Navigation.goBack();
    };

    const membersDetails: ListItem[] = [];
    if (policy?.employeeList) {
        for (const [email, policyEmployee] of Object.entries(policy.employeeList ?? {})) {
            if (isDeletedPolicyEmployee(policyEmployee, isOffline)) {
                continue;
            }

            const personalDetail = getPersonalDetailByEmail(email);
            membersDetails.push({
                keyForList: email,
                text: personalDetail?.displayName,
                alternateText: email,
                login: email,
                accountID: personalDetail?.accountID,
                isSelected: assignCard?.cardToAssign?.email === email,
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

    let assignees = filterGuideAndAccountManager(membersDetails, assignedGuideEmail, accountManagerLogin);
    if (debouncedSearchTerm && areOptionsInitialized) {
        const searchValueForOptions = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();
        const filteredMembers = filterGuideAndAccountManager(membersDetails, assignedGuideEmail, accountManagerLogin);
        const filteredOptions = tokenizedSearch(filteredMembers, searchValueForOptions, (option) => [option.text ?? '', option.alternateText ?? '']);

        const options = [
            ...filteredOptions,
            ...selectedOptionsForDisplay,
            ...availableOptions.recentReports,
            ...availableOptions.personalDetails,
            ...(availableOptions.userToInvite ? [availableOptions.userToInvite] : []),
        ];

        assignees = options.map((option) => ({
            ...option,
            keyForList: option.keyForList ?? option.login ?? '',
        }));
    } else if (debouncedSearchTerm) {
        assignees = [];
    }

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const searchValue = debouncedSearchTerm.trim().toLowerCase();
    const headerMessage =
        !availableOptions.userToInvite && CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]
            ? translate('messages.errorMessageInvalidEmail')
            : getHeaderMessage(assignees.length > 0, !!availableOptions.userToInvite, searchValue, countryCode, false);

    const textInputOptions = {
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        value: searchTerm,
        onChangeText: setSearchTerm,
        headerMessage,
    };

    return (
        <InteractiveStepWrapper
            wrapperID="AssigneeStep"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('workspace.companyCards.assignCard')}
            enableEdgeToEdgeBottomSafeAreaPadding
            onEntryTransitionEnd={() => setDidScreenTransitionEnd(true)}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.chooseTheCardholder')}</Text>
            <SelectionList
                data={assignees}
                onSelectRow={submit}
                ListItem={UserListItem}
                textInputOptions={textInputOptions}
                initiallyFocusedItemKey={assignCard?.cardToAssign?.email}
                showLoadingPlaceholder={!areOptionsInitialized}
                isLoadingNewOptions={!!isSearchingForReports}
                disableMaintainingScrollPosition
                shouldUpdateFocusedIndex
                addBottomSafeAreaPadding
            />
        </InteractiveStepWrapper>
    );
}

export default AssigneeStep;
