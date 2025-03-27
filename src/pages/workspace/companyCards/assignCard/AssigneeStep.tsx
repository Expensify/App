import React, {useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import * as Expensicons from '@components/Icon/Expensicons';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import Text from '@components/Text';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {filterInactiveCards, getDefaultCardName, getFilteredCardList, hasOnlyOneCardToAssign} from '@libs/CardUtils';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import {getHeaderMessage, getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import {setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {AssignCardData, AssignCardStep} from '@src/types/onyx/AssignCard';

const MINIMUM_MEMBER_TO_SHOW_SEARCH = 8;

type AssigneeStepProps = {
    /** The policy that the card will be issued under */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Selected feed */
    feed: OnyxTypes.CompanyCardFeed;
};

function AssigneeStep({policy, feed}: AssigneeStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const [list] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${feed}`, {selector: filterInactiveCards});
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const filteredCardList = getFilteredCardList(list, cardFeeds?.settings?.oAuthAccountDetails?.[feed]);

    const isEditing = assignCard?.isEditing;

    const [selectedMember, setSelectedMember] = useState(assignCard?.data?.email ?? '');
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
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
        Navigation.goBack();
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

        membersList = sortAlphabetically(membersList, 'text');

        return membersList;
    }, [isOffline, policy?.employeeList, selectedMember]);

    const sections = useMemo(() => {
        if (!debouncedSearchTerm) {
            return [
                {
                    data: membersDetails,
                    shouldShow: true,
                },
            ];
        }

        const searchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm).toLowerCase();
        const filteredOptions = membersDetails.filter((option) => !!option.text?.toLowerCase().includes(searchValue) || !!option.alternateText?.toLowerCase().includes(searchValue));

        return [
            {
                title: undefined,
                data: filteredOptions,
                shouldShow: true,
            },
        ];
    }, [membersDetails, debouncedSearchTerm]);

    const headerMessage = useMemo(() => {
        const searchValue = debouncedSearchTerm.trim().toLowerCase();

        return getHeaderMessage(sections[0].data.length !== 0, false, searchValue);
    }, [debouncedSearchTerm, sections]);

    return (
        <InteractiveStepWrapper
            wrapperID={AssigneeStep.displayName}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={0}
            stepNames={CONST.COMPANY_CARD.STEP_NAMES}
            headerTitle={translate('workspace.companyCards.assignCard')}
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
            />
            <FormAlertWithSubmitButton
                buttonText={translate(isEditing ? 'common.confirm' : 'common.next')}
                onSubmit={submit}
                isAlertVisible={shouldShowError}
                containerStyles={[styles.ph5, !shouldShowError && styles.mt5]}
                message={translate('common.error.pleaseSelectOne')}
                buttonStyles={styles.mb5}
            />
        </InteractiveStepWrapper>
    );
}

AssigneeStep.displayName = 'AssigneeStep';

export default AssigneeStep;
