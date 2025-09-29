import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import SelectionList from '@components/SelectionListWithSections';
import type {ListItem} from '@components/SelectionListWithSections/types';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import Text from '@components/Text';
import useCurrencyForExpensifyCard from '@hooks/useCurrencyForExpensifyCard';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail, getUserNameByEmail} from '@libs/PersonalDetailsUtils';
import {isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import useOptions from '@libs/UseOptionsUtils';
import Navigation from '@navigation/Navigation';
import {clearIssueNewCardFlow, getCardDefaultName, setDraftInviteAccountID, setIssueNewCardStepAndData} from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {IssueNewCardData} from '@src/types/onyx/Card';

type AssigneeStepProps = {
    // The policy that the card will be issued under
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Array of step names */
    stepNames: readonly string[];

    /** Start from step index */
    startStepIndex: number;
};

function AssigneeStep({policy, stepNames, startStepIndex}: AssigneeStepProps) {
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const policyID = policy?.id;
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {canBeMissing: true});
    const [countryCode] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const {userToInvite, searchValue, personalDetails, debouncedSearchValue, setSearchValue, areOptionsInitialized, headerMessage} = useOptions();
    const currency = useCurrencyForExpensifyCard({policyID});

    const isEditing = issueNewCard?.isEditing;

    const submit = (assignee: ListItem) => {
        const data: Partial<IssueNewCardData> = {
            assigneeEmail: assignee?.login ?? '',
            currency,
        };

        if (isEditing && issueNewCard?.data?.cardTitle === getCardDefaultName(getUserNameByEmail(issueNewCard?.data?.assigneeEmail, 'firstName'))) {
            // If the card title is the default card title, update it with the new assignee's name
            data.cardTitle = getCardDefaultName(getUserNameByEmail(assignee?.login ?? '', 'firstName'));
        }

        if (userToInvite?.accountID === assignee?.accountID) {
            data.assigneeAccountID = assignee?.accountID;
            setIssueNewCardStepAndData({
                step: CONST.EXPENSIFY_CARD.STEP.INVITE_NEW_MEMBER,
                data,
                policyID,
            });
            setDraftInviteAccountID(data.assigneeEmail, assignee?.accountID, policyID);
            return;
        }

        setIssueNewCardStepAndData({
            step: isEditing ? CONST.EXPENSIFY_CARD.STEP.CONFIRMATION : CONST.EXPENSIFY_CARD.STEP.CARD_TYPE,
            data,
            isEditing: false,
            policyID,
        });
    };

    const handleBackButtonPress = () => {
        if (isEditing) {
            setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID});
            return;
        }
        Navigation.goBack();
        clearIssueNewCardFlow(policyID);
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
    }, [isOffline, policy?.employeeList, formatPhoneNumber, localeCompare]);

    const sections = useMemo(() => {
        if (!debouncedSearchValue) {
            return [
                {
                    data: membersDetails,
                    shouldShow: true,
                },
            ];
        }

        const searchValueForOptions = getSearchValueForPhoneOrEmail(debouncedSearchValue, countryCode).toLowerCase();
        const filteredOptions = tokenizedSearch(membersDetails, searchValueForOptions, (option) => [option.text ?? '', option.alternateText ?? '']);

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
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('workspace.card.issueCard')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={startStepIndex}
            stepNames={stepNames}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.whoNeedsCard')}</Text>
            <SelectionList
                textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                textInputValue={searchValue}
                onChangeText={setSearchValue}
                sections={areOptionsInitialized ? sections : []}
                headerMessage={headerMessage}
                ListItem={UserListItem}
                onSelectRow={submit}
                addBottomSafeAreaPadding
                showLoadingPlaceholder={!areOptionsInitialized}
            />
        </InteractiveStepWrapper>
    );
}

AssigneeStep.displayName = 'AssigneeStep';

export default AssigneeStep;
