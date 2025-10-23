import React, {useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import * as Expensicons from '@components/Icon/Expensicons';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import SelectionList from '@components/SelectionListWithSections';
import type {ListItem} from '@components/SelectionListWithSections/types';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import Text from '@components/Text';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDefaultCardName, getFilteredCardList, hasOnlyOneCardToAssign} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getHeaderMessage, getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import Navigation from '@navigation/Navigation';
import {useAssignCardStepNavigation} from '@pages/workspace/companyCards/utils';
import {setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {AssignCardData, AssignCardStep} from '@src/types/onyx/AssignCard';
import type {CompanyCardFeed} from '@src/types/onyx/CardFeeds';

const MINIMUM_MEMBER_TO_SHOW_SEARCH = 8;

type AssigneeStepProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE>;

function AssigneeStep({route}: AssigneeStepProps) {
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: false});
    const [countryCode] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const policyID = route.params?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const feed = decodeURIComponent(route.params?.feed) as CompanyCardFeed;
    const [list] = useCardsList(policyID, feed);
    const [cardFeeds] = useCardFeeds(policyID);
    const filteredCardList = getFilteredCardList(list, cardFeeds?.settings?.oAuthAccountDetails?.[feed], workspaceCardFeeds);

    const isEditing = assignCard?.isEditing;

    const [selectedMember, setSelectedMember] = useState(assignCard?.data?.email ?? '');
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [shouldShowError, setShouldShowError] = useState(false);

    const selectMember = (assignee: ListItem) => {
        Keyboard.dismiss();
        setSelectedMember(assignee.login ?? '');
        setShouldShowError(false);
    };

    useAssignCardStepNavigation(policyID, feed, route.params?.backTo);

    const submit = () => {
        let nextStep: AssignCardStep = CONST.COMPANY_CARD.STEP.CARD;
        if (selectedMember === assignCard?.data?.email) {
            setAssignCardStepAndData({
                currentStep: isEditing ? CONST.COMPANY_CARD.STEP.CONFIRMATION : nextStep,
                isEditing: false,
            });
            return;
        }

        if (!selectedMember) {
            setShouldShowError(true);
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
        Navigation.dismissModal();
    };

    const shouldShowSearchInput = policy?.employeeList && Object.keys(policy.employeeList).length >= MINIMUM_MEMBER_TO_SHOW_SEARCH;
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

    const sections = useMemo(() => {
        if (!debouncedSearchTerm) {
            return [
                {
                    data: membersDetails,
                    shouldShow: true,
                },
            ];
        }

        const searchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();
        const filteredOptions = tokenizedSearch(membersDetails, searchValue, (option) => [option.text ?? '', option.alternateText ?? '']);

        return [
            {
                title: undefined,
                data: filteredOptions,
                shouldShow: true,
            },
        ];
    }, [membersDetails, debouncedSearchTerm, countryCode]);

    const headerMessage = useMemo(() => {
        const searchValue = debouncedSearchTerm.trim().toLowerCase();

        return getHeaderMessage(sections[0].data.length !== 0, false, searchValue, false, countryCode);
    }, [debouncedSearchTerm, sections, countryCode]);

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
                textInputValue={searchTerm}
                onChangeText={setSearchTerm}
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
            />
        </InteractiveStepWrapper>
    );
}

AssigneeStep.displayName = 'AssigneeStep';

export default AssigneeStep;
