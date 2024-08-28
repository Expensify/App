import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import Text from '@components/Text';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

const MINIMUM_MEMBER_TO_SHOW_SEARCH = 8;

type AssigneeStepProps = {
    // The policy that the card will be issued under
    policy: OnyxEntry<OnyxTypes.Policy>;
};

function AssigneeStep({policy}: AssigneeStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [issueNewCard] = useOnyx(ONYXKEYS.ISSUE_NEW_EXPENSIFY_CARD);

    const isEditing = issueNewCard?.isEditing;

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');

    const submit = (assignee: ListItem) => {
        Card.setIssueNewCardStepAndData({
            step: isEditing ? CONST.EXPENSIFY_CARD.STEP.CONFIRMATION : CONST.EXPENSIFY_CARD.STEP.CARD_TYPE,
            data: {
                assigneeEmail: assignee?.login ?? '',
            },
            isEditing: false,
        });
    };

    const handleBackButtonPress = () => {
        if (isEditing) {
            Card.setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false});
            return;
        }
        Navigation.goBack();
        Card.clearIssueNewCardFlow();
    };

    const shouldShowSearchInput = policy?.employeeList && Object.keys(policy.employeeList).length >= MINIMUM_MEMBER_TO_SHOW_SEARCH;
    const textInputLabel = shouldShowSearchInput ? translate('workspace.card.issueNewCard.findMember') : undefined;

    const membersDetails = useMemo(() => {
        let membersList: ListItem[] = [];
        if (!policy?.employeeList) {
            return membersList;
        }

        Object.entries(policy.employeeList ?? {}).forEach(([email, policyEmployee]) => {
            if (PolicyUtils.isDeletedPolicyEmployee(policyEmployee, isOffline)) {
                return;
            }

            const personalDetail = PersonalDetailsUtils.getPersonalDetailByEmail(email);
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

        membersList = OptionsListUtils.sortAlphabetically(membersList, 'text');

        return membersList;
    }, [isOffline, policy?.employeeList]);

    const sections = useMemo(() => {
        if (!debouncedSearchTerm) {
            return [
                {
                    data: membersDetails,
                    shouldShow: true,
                },
            ];
        }

        const searchValue = OptionsListUtils.getSearchValueForPhoneOrEmail(debouncedSearchTerm).toLowerCase();
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

        return OptionsListUtils.getHeaderMessage(sections[0].data.length !== 0, false, searchValue);
    }, [debouncedSearchTerm, sections]);

    return (
        <ScreenWrapper
            testID={AssigneeStep.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.card.issueCard')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={0}
                    stepNames={CONST.EXPENSIFY_CARD.STEP_NAMES}
                />
            </View>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.whoNeedsCard')}</Text>
            <SelectionList
                textInputLabel={textInputLabel}
                textInputValue={searchTerm}
                onChangeText={setSearchTerm}
                sections={sections}
                headerMessage={headerMessage}
                ListItem={UserListItem}
                onSelectRow={submit}
            />
        </ScreenWrapper>
    );
}

AssigneeStep.displayName = 'AssigneeStep';

export default AssigneeStep;
