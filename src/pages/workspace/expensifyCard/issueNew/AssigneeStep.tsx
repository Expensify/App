import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useCurrencyForExpensifyCard from '@hooks/useCurrencyForExpensifyCard';
import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getHeaderMessage, getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail, getUserNameByEmail} from '@libs/PersonalDetailsUtils';
import {isDeletedPolicyEmployee} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import Navigation from '@navigation/Navigation';
import {clearIssueNewCardFlow, getCardDefaultName, setIssueNewCardStepAndData} from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {IssueNewCardData} from '@src/types/onyx/Card';

const MINIMUM_MEMBER_TO_SHOW_SEARCH = 8;

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
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar'] as const);
    const currency = useCurrencyForExpensifyCard({policyID});

    const isEditing = issueNewCard?.isEditing;

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');

    const submit = (assignee: ListItem) => {
        const data: Partial<IssueNewCardData> = {
            assigneeEmail: assignee?.login ?? '',
            currency,
        };

        if (isEditing && issueNewCard?.data?.cardTitle === getCardDefaultName(getUserNameByEmail(issueNewCard?.data?.assigneeEmail, 'firstName'))) {
            // If the card title is the default card title, update it with the new assignee's name
            data.cardTitle = getCardDefaultName(getUserNameByEmail(assignee?.login ?? '', 'firstName'));
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

    const shouldShowSearchInput = policy?.employeeList && Object.keys(policy.employeeList).length >= MINIMUM_MEMBER_TO_SHOW_SEARCH;
    const textInputLabel = shouldShowSearchInput ? translate('workspace.card.issueNewCard.findMember') : undefined;

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

        membersList = sortAlphabetically(membersList, 'text', localeCompare);

        return membersList;
    }, [policy?.employeeList, localeCompare, isOffline, issueNewCard?.data?.assigneeEmail, icons.FallbackAvatar, formatPhoneNumber]);

    const assignees = useMemo(() => {
        if (!debouncedSearchTerm) {
            return membersDetails;
        }

        const searchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();

        return tokenizedSearch(membersDetails, searchValue, (option) => [option.text ?? '', option.alternateText ?? '']);
    }, [debouncedSearchTerm, countryCode, membersDetails]);

    const headerMessage = useMemo(() => {
        const searchValue = debouncedSearchTerm.trim().toLowerCase();

        return getHeaderMessage(assignees.length !== 0, false, searchValue, countryCode, false);
    }, [debouncedSearchTerm, assignees, countryCode]);

    const textInputOptions = useMemo(
        () => ({
            label: textInputLabel,
            value: searchTerm,
            onChangeText: setSearchTerm,
            headerMessage,
        }),
        [headerMessage, searchTerm, setSearchTerm, textInputLabel],
    );

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
                textInputOptions={textInputOptions}
                data={assignees}
                ListItem={UserListItem}
                onSelectRow={submit}
                addBottomSafeAreaPadding
                initiallyFocusedItemKey={assignees.find((option) => option.isSelected)?.keyForList}
                disableMaintainingScrollPosition
            />
        </InteractiveStepWrapper>
    );
}

AssigneeStep.displayName = 'AssigneeStep';

export default AssigneeStep;
