import React, {useMemo} from 'react';
import {Keyboard} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
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

    const {userToInvite, searchValue, personalDetails, debouncedSearchValue, setSearchValue, areOptionsInitialized, headerMessage, isSearchingForReports} = useOptions();
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

        if (userToInvite?.accountID === assignee?.accountID) {
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.INVITE_NEW_MEMBER,
                data: {
                    email: assignee?.login ?? '',
                    assigneeAccountID: assignee?.accountID,
                },
            });
            setDraftInviteAccountID(assignee?.login ?? '', assignee?.accountID, policy?.id);
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
        Navigation.goBack();
    };

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
                isSelected: assignCard?.data?.email === email,
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
    }, [isOffline, policy?.employeeList, assignCard?.data?.email, formatPhoneNumber, localeCompare]);

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
                data: userToInvite ? [userToInvite] : [],
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
    }, [debouncedSearchValue, membersDetails, userToInvite, personalDetails, countryCode]);

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
                textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                textInputValue={searchValue}
                onChangeText={setSearchValue}
                sections={sections}
                headerMessage={headerMessage}
                ListItem={UserListItem}
                onSelectRow={submit}
                shouldUpdateFocusedIndex
                addBottomSafeAreaPadding
                showLoadingPlaceholder={!areOptionsInitialized}
                isLoadingNewOptions={!!isSearchingForReports}
            />
        </InteractiveStepWrapper>
    );
}

AssigneeStep.displayName = 'AssigneeStep';

export default AssigneeStep;
