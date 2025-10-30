import React, {useEffect, useMemo, useState} from 'react';
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
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {getHeaderMessage, getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail, getUserNameByEmail} from '@libs/PersonalDetailsUtils';
import {getIneligibleInvitees, isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
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
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});

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
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
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

        // check if the assinee accountID is not in the employeeList
        if (!policy?.employeeList?.[assignee?.login ?? '']) {
            data.assigneeAccountID = assignee?.accountID ?? undefined;
            setIssueNewCardStepAndData({
                step: CONST.EXPENSIFY_CARD.STEP.INVITE_NEW_MEMBER,
                data,
                policyID,
            });
            setDraftInviteAccountID(data.assigneeEmail, assignee?.accountID ?? undefined, policyID);
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
                isSelected: issueNewCard?.data?.assigneeEmail === email,
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
    }, [policy?.employeeList, localeCompare, isOffline, issueNewCard?.data?.assigneeEmail, formatPhoneNumber]);

    const sections = useMemo(() => {
        if (!debouncedSearchTerm) {
            return [
                {
                    data: membersDetails,
                    shouldShow: true,
                },
            ];
        }

        const sectionsArr = [];

        if (!areOptionsInitialized) {
            return [];
        }

        const searchValueForOptions = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();
        const filteredOptions = tokenizedSearch(membersDetails, searchValueForOptions, (option) => [option.text ?? '', option.alternateText ?? '']);

        sectionsArr.push({
            title: undefined,
            data: filteredOptions,
            shouldShow: true,
        });

        // Selected options section
        if (selectedOptionsForDisplay.length > 0) {
            sectionsArr.push({
                title: undefined,
                data: selectedOptionsForDisplay,
            });
        }

        // Recent reports section
        if (availableOptions.recentReports.length > 0) {
            sectionsArr.push({
                title: undefined,
                data: availableOptions.recentReports,
            });
        }

        // Contacts section
        if (availableOptions.personalDetails.length > 0) {
            sectionsArr.push({
                title: undefined,
                data: availableOptions.personalDetails,
            });
        }

        // User to invite section
        if (availableOptions.userToInvite) {
            sectionsArr.push({
                title: undefined,
                data: [availableOptions.userToInvite],
            });
        }

        return sectionsArr;
    }, [
        debouncedSearchTerm,
        areOptionsInitialized,
        countryCode,
        membersDetails,
        selectedOptionsForDisplay,
        availableOptions.recentReports,
        availableOptions.personalDetails,
        availableOptions.userToInvite,
    ]);

    useEffect(() => {
        searchInServer(searchTerm);
    }, [searchTerm]);

    const headerMessage = useMemo(() => {
        const searchValue = searchTerm.trim().toLowerCase();
        if (!availableOptions.userToInvite && CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        return getHeaderMessage(
            sections.some((section) => section.data.length > 0),
            !!availableOptions.userToInvite,
            searchValue,
            countryCode,
            false,
        );
    }, [searchTerm, availableOptions.userToInvite, sections, countryCode, translate]);

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
            onEntryTransitionEnd={() => setDidScreenTransitionEnd(true)}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.whoNeedsCard')}</Text>
            <SelectionList
                textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                textInputValue={searchTerm}
                onChangeText={setSearchTerm}
                sections={areOptionsInitialized ? sections : []}
                headerMessage={headerMessage}
                ListItem={UserListItem}
                onSelectRow={submit}
                addBottomSafeAreaPadding
                isLoadingNewOptions={!!isSearchingForReports}
            />
        </InteractiveStepWrapper>
    );
}

AssigneeStep.displayName = 'AssigneeStep';

export default AssigneeStep;
