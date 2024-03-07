import React, {useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import Badge from '@components/Badge';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
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
    const StyleUtils = useStyleUtils();
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

    const sections = useMemo(
        () =>
            selectedOptions
                .map((selectedOption) => {
                    const accountID = selectedOption.accountID;
                    let roleBadge = null;
                    const isAdmin = personalData.accountID === selectedOption.accountID;
                    if (isAdmin) {
                        roleBadge = (
                            <Badge
                                text={translate('common.admin')}
                                textStyles={styles.textStrong}
                                badgeStyles={[styles.justifyContentCenter, StyleUtils.getMinimumWidth(60), styles.badgeBordered, styles.activeItemBadge]}
                            />
                        );
                    }
                    return {
                        value: selectedOption?.text ?? '',
                        text: selectedOption?.text ?? '',
                        keyForList: selectedOption?.keyForList ?? '',
                        isSelected: !isAdmin,
                        rightElement: roleBadge,
                        accountID,
                        icons: selectedOption?.icons,
                    };
                })
                .sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase())),
        [selectedOptions, personalData.accountID, translate, styles.textStrong, styles.justifyContentCenter, styles.badgeBordered, styles.activeItemBadge, StyleUtils],
    );
    /**
     * Removes a selected option from list if already selected.
     */
    const unselectOption = (option: ListItem) => {
        if (!selectedOptions) {
            return;
        }
        const isOptionInList = selectedOptions.some((selectedOption) => selectedOption.accountID === option.accountID);

        if (isOptionInList && personalData && option.accountID === personalData.accountID) {
            return;
        }

        if (isOptionInList) {
            const newSelectedAccountIDs = selectedOptions.filter((selectedOption) => selectedOption.accountID !== option.accountID).map((optionData) => optionData.accountID) as number[];
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
                <SelectionList
                    sections={[{data: sections, indexOffset: 0, isDisabled: false}]}
                    ListItem={TableListItem}
                    onSelectRow={unselectOption}
                    showConfirmButton
                    confirmButtonText={translate('newChatPage.startGroup')}
                    onConfirm={createGroup}
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
