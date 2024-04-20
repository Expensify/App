import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import Badge from '@components/Badge';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import type {ListItem} from '@components/SelectionList/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
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
    const optimisticReportID = useRef<string>(ReportUtils.generateReportID());
    const fileRef = useRef<File | CustomRNImageManipulatorResult | undefined>();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const personalData = useCurrentUserPersonalDetails();
    const participantAccountIDs = (newGroupDraft?.participants ?? []).map((participant) => participant.accountID);
    const selectedOptions = useMemo((): Participant[] => {
        if (!newGroupDraft?.participants) {
            return [];
        }
        const options: Participant[] = newGroupDraft.participants.map((participant) =>
            OptionsListUtils.getParticipantsOption({accountID: participant.accountID, login: participant.login, reportID: ''}, allPersonalDetails),
        );
        return options;
    }, [allPersonalDetails, newGroupDraft?.participants]);

    const groupName = newGroupDraft?.reportName ? newGroupDraft?.reportName : ReportUtils.getGroupChatName(participantAccountIDs ?? []);
    const sections: ListItem[] = useMemo(
        () =>
            selectedOptions
                .map((selectedOption: Participant) => {
                    const accountID = selectedOption.accountID;
                    const isAdmin = personalData.accountID === accountID;
                    const section: ListItem = {
                        login: selectedOption?.login ?? '',
                        text: selectedOption?.text ?? '',
                        keyForList: selectedOption?.keyForList ?? '',
                        isSelected: !isAdmin,
                        isDisabled: isAdmin,
                        accountID,
                        icons: selectedOption?.icons,
                        alternateText: selectedOption?.login ?? '',
                        rightElement: isAdmin ? (
                            <Badge
                                text={translate('common.admin')}
                                textStyles={styles.textStrong}
                                badgeStyles={[styles.justifyContentCenter, StyleUtils.getMinimumWidth(60), styles.badgeBordered]}
                            />
                        ) : undefined,
                    };
                    return section;
                })
                .sort((a, b) => a.text?.toLowerCase().localeCompare(b.text?.toLowerCase() ?? '') ?? -1),
        [selectedOptions, personalData.accountID, translate, StyleUtils, styles],
    );

    /**
     * Removes a selected option from list if already selected.
     */
    const unselectOption = (option: ListItem) => {
        if (!newGroupDraft) {
            return;
        }
        const newSelectedParticipants = (newGroupDraft.participants ?? []).filter((participant) => participant.login !== option.login);
        Report.setGroupDraft({participants: newSelectedParticipants});
    };

    const createGroup = () => {
        if (!newGroupDraft) {
            return;
        }

        const logins: string[] = (newGroupDraft.participants ?? []).map((participant) => participant.login);
        Report.navigateToAndOpenReport(logins, true, newGroupDraft.reportName ?? '', newGroupDraft.avatarUri ?? '', fileRef.current, optimisticReportID.current);
    };

    const navigateBack = () => {
        Navigation.goBack(ROUTES.NEW_CHAT);
    };

    const navigateToEditChatName = () => {
        Navigation.navigate(ROUTES.NEW_CHAT_EDIT_NAME);
    };

    const stashedLocalAvatarImage = newGroupDraft?.avatarUri;
    return (
        <ScreenWrapper testID={NewChatConfirmPage.displayName}>
            <HeaderWithBackButton
                title={translate('common.group')}
                onBackButtonPress={navigateBack}
            />
            <View style={styles.avatarSectionWrapper}>
                <AvatarWithImagePicker
                    isUsingDefaultAvatar={!stashedLocalAvatarImage}
                    source={stashedLocalAvatarImage ?? ReportUtils.getDefaultGroupAvatar(optimisticReportID.current)}
                    onImageSelected={(image) => {
                        fileRef.current = image;
                        Report.setGroupDraft({avatarUri: image?.uri ?? ''});
                    }}
                    onImageRemoved={() => {
                        fileRef.current = undefined;
                        Report.setGroupDraft({avatarUri: null});
                    }}
                    size={CONST.AVATAR_SIZE.XLARGE}
                    avatarStyle={styles.avatarXLarge}
                    shouldDisableViewPhoto
                    editIcon={Expensicons.Camera}
                    editIconStyle={styles.smallEditIconAccount}
                />
            </View>
            <MenuItemWithTopDescription
                title={groupName}
                onPress={navigateToEditChatName}
                shouldShowRightIcon
                shouldCheckActionAllowedOnPress={false}
                description={translate('groupConfirmPage.groupName')}
                wrapperStyle={[styles.ph4]}
            />
            <View style={[styles.flex1, styles.mt3]}>
                <SelectionList
                    canSelectMultiple
                    sections={[{title: translate('common.members'), data: sections}]}
                    ListItem={InviteMemberListItem}
                    onSelectRow={unselectOption}
                    showConfirmButton={selectedOptions.length > 1}
                    confirmButtonText={translate('newChatPage.startGroup')}
                    onConfirm={selectedOptions.length > 1 ? createGroup : undefined}
                    shouldHideListOnInitialRender={false}
                />
            </View>
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
