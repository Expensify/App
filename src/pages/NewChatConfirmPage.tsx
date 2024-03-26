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
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

type NewChatConfirmPageOnyxProps = {
    /** New group chat draft data */
    newGroupDraft: OnyxEntry<OnyxTypes.NewGroupChatDraft>;

    /** All of the personal details for everyone */
    allPersonalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
};

type NewChatConfirmPageProps = NewChatConfirmPageOnyxProps;

function NewChatConfirmPage({newGroupDraft, allPersonalDetails}: NewChatConfirmPageProps) {
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const personalData = useCurrentUserPersonalDetails();
    const participantAccountIDs = newGroupDraft?.participants.map((participant) => participant.accountID);
    const selectedOptions = useMemo((): Participant[] => {
        if (!newGroupDraft?.participants) {
            return [];
        }
        const options: Participant[] = newGroupDraft.participants.map((participant) =>
            OptionsListUtils.getParticipantsOption({accountID: participant.accountID, login: participant.login, reportID: ''}, allPersonalDetails),
        );
        return options;
    }, [allPersonalDetails, newGroupDraft?.participants]);

    const groupName = ReportUtils.getGroupChatName(participantAccountIDs ?? []);

    const sections: ListItem[] = useMemo(
        () =>
            selectedOptions
                .map((selectedOption: Participant) => {
                    const accountID = selectedOption.accountID;
                    const isAdmin = personalData.accountID === accountID;
                    let roleBadge = null;
                    if (isAdmin) {
                        roleBadge = (
                            <Badge
                                text={translate('common.admin')}
                                textStyles={styles.textStrong}
                                badgeStyles={[styles.justifyContentCenter, StyleUtils.getMinimumWidth(60), styles.badgeBordered, styles.activeItemBadge]}
                            />
                        );
                    }

                    const section: ListItem = {
                        login: selectedOption?.login ?? '',
                        text: selectedOption?.text ?? '',
                        keyForList: selectedOption?.keyForList ?? '',
                        isSelected: !isAdmin,
                        isDisabled: isAdmin,
                        rightElement: roleBadge,
                        accountID,
                        icons: selectedOption?.icons,
                    };
                    return section;
                })
                .sort((a, b) => a.text?.toLowerCase().localeCompare(b.text?.toLowerCase() ?? '') ?? -1),
        [selectedOptions, personalData.accountID, translate, styles.textStrong, styles.justifyContentCenter, styles.badgeBordered, styles.activeItemBadge, StyleUtils],
    );

    /**
     * Removes a selected option from list if already selected.
     */
    const unselectOption = (option: ListItem) => {
        if (!newGroupDraft) {
            return;
        }
        const newSelectedParticipants = newGroupDraft.participants.filter((participant) => participant.login !== option.login);
        Report.setGroupDraft(newSelectedParticipants);
    };

    const createGroup = () => {
        if (!newGroupDraft) {
            return;
        }
        const logins: string[] = newGroupDraft.participants.map((participant) => participant.login);
        Report.navigateToAndOpenReport(logins, true, groupName);
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
                shouldCheckActionAllowedOnPress={false}
                description={translate('groupConfirmPage.groupName')}
            />
            <SelectionList
                sections={[{data: sections, indexOffset: 0}]}
                ListItem={TableListItem}
                onSelectRow={unselectOption}
                showConfirmButton={selectedOptions.length > 1}
                confirmButtonText={translate('newChatPage.startGroup')}
                onConfirm={createGroup}
            />
        </ScreenWrapper>
    );
}

NewChatConfirmPage.displayName = 'NewChatConfirmPage';

export default withOnyx<NewChatConfirmPageProps, NewChatConfirmPageOnyxProps>({
    newGroupDraft: {
        key: ONYXKEYS.NEW_GROUP_CHAT_DRAFT,
    },
    allPersonalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
})(NewChatConfirmPage);
