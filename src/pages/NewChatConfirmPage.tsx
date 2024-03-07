import React, {useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OptionsSelector from '@components/OptionsSelector';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as GroupChatUtils from '@libs/GroupChatUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type NewChatConfirmPageOnyxProps = {
    /** New group chat draft data */
    newGroupDraft: OnyxEntry<OnyxTypes.NewGroupChat>;

    /** All of the personal details for everyone */
    allPersonalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
};

type NewChatConfirmPageProps = NewChatConfirmPageOnyxProps;

function NewChatConfirmPage({newGroupDraft, allPersonalDetails}: NewChatConfirmPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const personalData = useCurrentUserPersonalDetails() || CONST.EMPTY_OBJECT;

    const selectedOptions = useMemo(() => {
        const invitedUsersPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs(newGroupDraft?.selectedOptions, allPersonalDetails);
        const members = OptionsListUtils.getMemberInviteOptions(invitedUsersPersonalDetails);
        const currentUserOptionData = members.currentUserOption;
        const options = [...members.personalDetails, currentUserOptionData] as OptionData[];
        return options;
    }, [newGroupDraft, allPersonalDetails]);

    const groupName = GroupChatUtils.getGroupChatConfirmName(selectedOptions);

    const sections = useMemo(() => {
        const sectionsList = [];
        if (selectedOptions) {
            sectionsList.push({
                title: translate('common.members'),
                data: selectedOptions,
                shouldShow: true,
                indexOffset: 0,
            });
        }
        return sectionsList;
    }, [translate, selectedOptions]);

    /**
     * Removes a selected option from list if already selected.
     */
    const unselectOption = (option: OptionData) => {
        if (!selectedOptions) {
            return;
        }
        const isOptionInList = selectedOptions.some((selectedOption) => selectedOption.login === option.login);

        if (isOptionInList && personalData && option.accountID === personalData.accountID) {
            return;
        }

        if (isOptionInList) {
            const newSelectedAccountIDs = selectedOptions.filter((selectedOption) => selectedOption.login !== option.login).map((optionData) => optionData.accountID) as number[];
            Report.setGroupDraft(newSelectedAccountIDs);
        }
    };

    const createGroup = () => {
        const logins = selectedOptions.map((option: OptionData) => option.login) as string[];
        if (logins.length < 1) {
            return;
        }
        const accountIDs = selectedOptions.map((selectedOption: OptionData) => selectedOption.accountID) as number[];
        Report.setGroupDraft(accountIDs, groupName);
        Report.navigateToAndOpenReport(logins, true, '');
    };

    const navigateBack = () => {
        Navigation.goBack(ROUTES.NEW_CHAT);
    };

    return (
        <ScreenWrapper testID={NewChatConfirmPage.displayName}>
            <HeaderWithBackButton
                title={translate('common.group')}
                onBackButtonPress={navigateBack}
            />
            <View style={styles.avatarSectionWrapper}>
                <Avatar
                    containerStyles={[styles.avatarXLarge, styles.mb3]}
                    imageStyles={[styles.avatarXLarge]}
                    source={ReportUtils.getDefaultGroupAvatar()}
                    size={CONST.AVATAR_SIZE.XLARGE}
                />
            </View>
            <MenuItemWithTopDescription
                title={groupName}
                interactive={false}
                shouldRenderAsHTML
                shouldCheckActionAllowedOnPress={false}
                description={translate('groupConfirmPage.groupName')}
            />
            <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                <OptionsSelector
                    // @ts-expect-error TODO: Remove this once OptionsSelector (https://github.com/Expensify/App/issues/25125) is migrated to TypeScript.
                    canSelectMultipleOptions
                    shouldShowMultipleOptionSelectorAsButton
                    sections={sections}
                    selectedOptions={selectedOptions}
                    onAddToSelection={unselectOption}
                    shouldShowTextInput={false}
                    shouldShowConfirmButton
                    confirmButtonText={translate('newChatPage.startGroup')}
                    onConfirmSelection={createGroup}
                />
            </View>
        </ScreenWrapper>
    );
}

NewChatConfirmPage.displayName = 'NewChatConfirmPage';

export default withOnyx<NewChatConfirmPageProps, NewChatConfirmPageOnyxProps>({
    newGroupDraft: {
        key: ONYXKEYS.NEW_GROUP,
    },
    allPersonalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
})(NewChatConfirmPage);
