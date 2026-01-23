import React, {useEffect, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useCurrencyForExpensifyCard from '@hooks/useCurrencyForExpensifyCard';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchUserInServer} from '@libs/actions/Report';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getHeaderMessage, getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail, getUserNameByEmail} from '@libs/PersonalDetailsUtils';
import {getIneligibleInvitees, isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import Navigation from '@navigation/Navigation';
import {clearIssueNewCardFlow, getCardDefaultName, setDraftInviteAccountID, setIssueNewCardStepAndData} from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {IssueNewCardData} from '@src/types/onyx/Card';

type AssigneeStepProps = {
    // The policy that the card will be issued under
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Array of step names */
    stepNames: readonly string[];

    /** Start from step index */
    startStepIndex: number;

    /** Route params */
    route: PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_ISSUE_NEW>;
};

function AssigneeStep({policy, stepNames, startStepIndex, route}: AssigneeStepProps) {
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const {isOffline} = useNetwork();
    const policyID = route.params.policyID;
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {canBeMissing: true});
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});

    const ineligibleInvites = getIneligibleInvitees(policy?.employeeList);
    const excludedUsers: Record<string, boolean> = {};
    for (const login of ineligibleInvites) {
        excludedUsers[login] = true;
    }

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

        if (!policy?.employeeList?.[assignee?.login ?? '']) {
            setIssueNewCardStepAndData({
                step: CONST.EXPENSIFY_CARD.STEP.INVITE_NEW_MEMBER,
                data: {
                    currency,
                    invitingMemberEmail: assignee?.login ?? '',
                    invitingMemberAccountID: assignee?.accountID ?? undefined,
                },
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
                isSelected: issueNewCard?.data?.assigneeEmail === email,
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

    let assignees = membersDetails;
    if (debouncedSearchTerm && areOptionsInitialized) {
        const searchValueForOptions = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();

        const filteredMembers = tokenizedSearch(membersDetails, searchValueForOptions, (option) => [option.text ?? '', option.alternateText ?? '']);

        const options = [
            ...filteredMembers,
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
        searchUserInServer(debouncedSearchTerm);
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
                data={assignees}
                onSelectRow={submit}
                ListItem={UserListItem}
                textInputOptions={textInputOptions}
                isLoadingNewOptions={!!isSearchingForReports}
                initiallyFocusedItemKey={issueNewCard?.data?.assigneeEmail}
                disableMaintainingScrollPosition
                shouldUpdateFocusedIndex
                addBottomSafeAreaPadding
            />
        </InteractiveStepWrapper>
    );
}

export default AssigneeStep;
