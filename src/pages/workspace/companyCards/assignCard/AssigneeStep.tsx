import React, {useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import * as Expensicons from '@components/Icon/Expensicons';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import SelectionList from '@components/SelectionListWithSections';
import type {ListItem} from '@components/SelectionListWithSections/types';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import Text from '@components/Text';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setDraftInviteAccountID} from '@libs/actions/Card';
import {getDefaultCardName, getFilteredCardList, hasOnlyOneCardToAssign} from '@libs/CardUtils';
import {getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import useOptions from '@libs/UseOptionsUtils';
import Navigation from '@navigation/Navigation';
import {setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {AssignCardData, AssignCardStep} from '@src/types/onyx/AssignCard';

type AssigneeStepProps = {
    /** The policy that the card will be issued under */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Selected feed */
    feed: OnyxTypes.CompanyCardFeed;
};

function AssigneeStep({policy, feed}: AssigneeStepProps) {
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: false});
    const [countryCode] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [list] = useCardsList(policy?.id, feed);
    const [cardFeeds] = useCardFeeds(policy?.id);
    const filteredCardList = getFilteredCardList(list, cardFeeds?.settings?.oAuthAccountDetails?.[feed], workspaceCardFeeds);

    const {userToInvite, searchValue, personalDetails, debouncedSearchValue, setSearchValue, areOptionsInitialized, headerMessage} = useOptions();
    const isEditing = assignCard?.isEditing;

    const [selectedMember, setSelectedMember] = useState(assignCard?.data?.email ?? '');
    const [shouldShowError, setShouldShowError] = useState(false);

    const selectMember = (assignee: ListItem) => {
        Keyboard.dismiss();
        setSelectedMember(assignee.login ?? '');
        setShouldShowError(false);
    };

    const submit = () => {
        let nextStep: AssignCardStep = CONST.COMPANY_CARD.STEP.CARD;
        if (selectedMember === assignCard?.data?.email) {
            setAssignCardStepAndData({
                currentStep: isEditing ? CONST.COMPANY_CARD.STEP.CONFIRMATION : nextStep,
                isEditing: false,
            });
            return;
        }

        if (!selectedMember || (!searchValue && selectedMember !== policy?.employeeList?.[selectedMember]?.email)) {
            setShouldShowError(true);
            return;
        }

        if (userToInvite?.login === selectedMember) {
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.INVITE_NEW_MEMBER,
                data: {
                    email: selectedMember,
                    assigneeAccountID: userToInvite?.accountID,
                },
            });
            setDraftInviteAccountID(selectedMember, userToInvite?.accountID, policy?.id);
            return;
        }

        const personalDetail = getPersonalDetailByEmail(selectedMember);
        const memberName = personalDetail?.firstName ? personalDetail.firstName : personalDetail?.login;
        const data: Partial<AssignCardData> = {
            email: selectedMember,
            cardName: getDefaultCardName(memberName),
        };

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
        Navigation.goBack();
    };

    const shouldShowSearchInput = policy?.employeeList;
    const textInputLabel = shouldShowSearchInput ? translate('workspace.card.issueNewCard.findMember') : undefined;

    const membersDetails = useMemo(() => {
        let membersList: ListItem[] = [];
        if (!policy?.employeeList) {
            return membersList;
        }

        Object.entries(policy.employeeList ?? {}).forEach(([email, policyEmployee]) => {
            if (isDeletedPolicyEmployee(policyEmployee, isOffline)) {
                return;
            }

            const personalDetail = getPersonalDetailByEmail(email);
            membersList.push({
                keyForList: email,
                text: personalDetail?.displayName,
                alternateText: email,
                login: email,
                accountID: personalDetail?.accountID,
                isSelected: selectedMember === email,
                icons: [
                    {
                        source: personalDetail?.avatar ?? Expensicons.FallbackAvatar,
                        name: formatPhoneNumber(email),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: personalDetail?.accountID,
                    },
                ],
            });
        });

        membersList = sortAlphabetically(membersList, 'text', localeCompare);

        return membersList;
    }, [isOffline, policy?.employeeList, selectedMember, formatPhoneNumber, localeCompare]);

    const membersDetailsWithInviteNewMember = useMemo(() => {
        if (!userToInvite) {
            return {};
        }

        const newMember: ListItem = {
            keyForList: userToInvite?.login,
            text: userToInvite?.login,
            alternateText: userToInvite?.login,
            login: userToInvite?.login,
            isSelected: selectedMember === userToInvite?.login,
            accountID: userToInvite?.accountID,
        };

        return newMember;
    }, [selectedMember, userToInvite]);

    const sections = useMemo(() => {
        if (!debouncedSearchValue) {
            return [
                {
                    data: membersDetails,
                    shouldShow: true,
                },
            ];
        }

        const searchValueForPhoneOrEmail = getSearchValueForPhoneOrEmail(debouncedSearchValue, countryCode).toLowerCase();
        const filteredOptions = tokenizedSearch(membersDetails, searchValueForPhoneOrEmail, (option) => [option.text ?? '', option.alternateText ?? '']);

        return [
            {
                title: undefined,
                data: filteredOptions,
                shouldShow: true,
            },
            {
                title: undefined,
                data: userToInvite ? [membersDetailsWithInviteNewMember] : [],
                shouldShow: !!userToInvite,
            },
            ...(personalDetails
                ? [
                      {
                          title: undefined,
                          data: personalDetails,
                          shouldShow: !!personalDetails,
                      },
                  ]
                : []),
        ];
    }, [debouncedSearchValue, membersDetails, userToInvite, membersDetailsWithInviteNewMember, personalDetails, countryCode]);

    return (
        <InteractiveStepWrapper
            wrapperID={AssigneeStep.displayName}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={0}
            stepNames={CONST.COMPANY_CARD.STEP_NAMES}
            headerTitle={translate('workspace.companyCards.assignCard')}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.whoNeedsCardAssigned')}</Text>
            <SelectionList
                textInputLabel={textInputLabel}
                textInputValue={searchValue}
                onChangeText={setSearchValue}
                sections={sections}
                headerMessage={headerMessage}
                ListItem={UserListItem}
                onSelectRow={selectMember}
                initiallyFocusedOptionKey={selectedMember}
                shouldUpdateFocusedIndex
                addBottomSafeAreaPadding
                footerContent={
                    <FormAlertWithSubmitButton
                        buttonText={translate(isEditing ? 'common.confirm' : 'common.next')}
                        onSubmit={submit}
                        isAlertVisible={shouldShowError}
                        containerStyles={[!shouldShowError && styles.mt5]}
                        addButtonBottomPadding={false}
                        message={translate('common.error.pleaseSelectOne')}
                    />
                }
                showLoadingPlaceholder={!areOptionsInitialized}
            />
        </InteractiveStepWrapper>
    );
}

AssigneeStep.displayName = 'AssigneeStep';

export default AssigneeStep;
