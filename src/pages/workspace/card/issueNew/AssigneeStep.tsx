import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type AssigneeStepProps = {
    // The policy that the card will be issued under
    policy: OnyxEntry<OnyxTypes.Policy>;
};

function AssigneeStep({policy}: AssigneeStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [searchTerm, setSearchTerm] = useState('');

    const submit = (assignee: ListItem) => {
        Card.setIssueNewCardDataAndGoToStep({assigneeEmail: assignee?.login ?? ''}, CONST.EXPENSIFY_CARD.STEP.CARD_TYPE);
    };

    const handleBackButtonPress = () => {
        Navigation.goBack();
    };

    const shouldShowSearchInput = policy?.employeeList && Object.keys(policy.employeeList).length > 8;
    const textInputLabel = shouldShowSearchInput ? translate('workspace.card.issueNewCard.findMember') : undefined;

    const membersDetails = useMemo(() => {
        if (!policy?.employeeList) {
            return [];
        }

        return Object.keys(policy.employeeList)
            .map(PersonalDetailsUtils.getPersonalDetailByEmail)
            .map((detail) => ({
                keyForList: detail?.login,
                text: detail?.displayName,
                alternateText: detail?.login,
                login: detail?.login,
                accountID: detail?.accountID,
                icons: [
                    {
                        source: detail?.avatar ?? Expensicons.FallbackAvatar,
                        name: formatPhoneNumber(detail?.login ?? ''),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: detail?.accountID,
                    },
                ],
            }));
    }, [policy?.employeeList]);

    const sections = useMemo(() => {
        if (!searchTerm) {
            return [
                {
                    data: membersDetails,
                    shouldShow: true,
                },
            ];
        }

        const searchValue = OptionsListUtils.getSearchValueForPhoneOrEmail(searchTerm).toLowerCase();
        const filteredOptions = membersDetails.filter((option) => !!option.text?.toLowerCase().includes(searchValue) || !!option.alternateText?.toLowerCase().includes(searchValue));

        return [
            {
                title: undefined,
                data: filteredOptions,
                shouldShow: true,
            },
        ];
    }, [membersDetails, searchTerm]);

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
                ListItem={UserListItem}
                onSelectRow={submit}
            />
        </ScreenWrapper>
    );
}

AssigneeStep.displayName = 'AssigneeStep';

export default AssigneeStep;
