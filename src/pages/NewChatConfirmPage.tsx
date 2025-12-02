import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import Badge from '@components/Badge';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import {readFileAsync} from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getParticipantsOption} from '@libs/OptionsListUtils';
import {generateReportID, getDefaultGroupAvatar, getGroupChatName} from '@libs/ReportUtils';
import {navigateToAndOpenReport, setGroupDraft} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Participant} from '@src/types/onyx/IOU';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function navigateBack() {
    Navigation.goBack(ROUTES.NEW_CHAT);
}

function navigateToEditChatName() {
    Navigation.navigate(ROUTES.NEW_CHAT_EDIT_NAME);
}

function NewChatConfirmPage() {
    const optimisticReportID = useRef<string>(generateReportID());
    const [avatarFile, setAvatarFile] = useState<File | CustomRNImageManipulatorResult | undefined>();
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const personalData = useCurrentUserPersonalDetails();
    const [newGroupDraft, newGroupDraftMetaData] = useOnyx(ONYXKEYS.NEW_GROUP_CHAT_DRAFT, {canBeMissing: true});
    const [allPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const icons = useMemoizedLazyExpensifyIcons(['Camera'] as const);

    const selectedOptions = useMemo((): Participant[] => {
        if (!newGroupDraft?.participants) {
            return [];
        }
        const options: Participant[] = newGroupDraft.participants.map((participant) =>
            getParticipantsOption({accountID: participant.accountID, login: participant?.login, reportID: ''}, allPersonalDetails),
        );
        return options;
    }, [allPersonalDetails, newGroupDraft?.participants]);

    const groupName = newGroupDraft?.reportName ? newGroupDraft?.reportName : getGroupChatName(newGroupDraft?.participants);
    const selectedParticipants: ListItem[] = useMemo(
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
                        rightElement: isAdmin ? <Badge text={translate('common.admin')} /> : undefined,
                    };
                    return section;
                })
                .sort((a, b) => localeCompare(a.text?.toLowerCase() ?? '', b.text?.toLowerCase() ?? '')),
        [selectedOptions, personalData.accountID, translate, localeCompare],
    );

    /**
     * Removes a selected option from list if already selected.
     */
    const unselectOption = useCallback(
        (option: ListItem) => {
            if (!newGroupDraft) {
                return;
            }
            const newSelectedParticipants = (newGroupDraft.participants ?? []).filter((participant) => participant?.login !== option.login);
            setGroupDraft({participants: newSelectedParticipants});
        },
        [newGroupDraft],
    );

    const createGroup = useCallback(() => {
        if (!newGroupDraft) {
            return;
        }

        const logins: string[] = (newGroupDraft.participants ?? []).map((participant) => participant.login).filter((login): login is string => !!login);
        navigateToAndOpenReport(logins, true, newGroupDraft.reportName ?? '', newGroupDraft.avatarUri ?? '', avatarFile, optimisticReportID.current, true);
    }, [newGroupDraft, avatarFile]);

    const stashedLocalAvatarImage = newGroupDraft?.avatarUri;

    useEffect(() => {
        if (!stashedLocalAvatarImage || isLoadingOnyxValue(newGroupDraftMetaData)) {
            return;
        }

        const onSuccess = (file: File) => {
            setAvatarFile(file);
        };

        const onFailure = () => {
            setAvatarFile(undefined);
            setGroupDraft({avatarUri: null, avatarFileName: null, avatarFileType: null});
        };

        // If the user navigates back to the member selection page and then returns to the confirmation page, the component will re-mount, causing avatarFile to be null.
        // To handle this, we re-read the avatar image file from disk whenever the component re-mounts.
        readFileAsync(stashedLocalAvatarImage, newGroupDraft?.avatarFileName ?? '', onSuccess, onFailure, newGroupDraft?.avatarFileType ?? '');

        // we only need to run this when the component re-mounted and when the onyx is loaded completely
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [newGroupDraftMetaData]);

    return (
        <ScreenWrapper testID={NewChatConfirmPage.displayName}>
            <HeaderWithBackButton
                title={translate('common.group')}
                onBackButtonPress={navigateBack}
            />
            <View style={styles.avatarSectionWrapper}>
                <AvatarWithImagePicker
                    isUsingDefaultAvatar={!stashedLocalAvatarImage}
                    // eslint-disable-next-line react-compiler/react-compiler
                    source={stashedLocalAvatarImage ?? getDefaultGroupAvatar(optimisticReportID.current)}
                    onImageSelected={(image) => {
                        setAvatarFile(image);
                        setGroupDraft({avatarUri: image.uri ?? '', avatarFileName: image.name ?? '', avatarFileType: image.type});
                    }}
                    onImageRemoved={() => {
                        setAvatarFile(undefined);
                        setGroupDraft({avatarUri: null, avatarFileName: null, avatarFileType: null});
                    }}
                    size={CONST.AVATAR_SIZE.X_LARGE}
                    avatarStyle={styles.avatarXLarge}
                    editIcon={icons.Camera}
                    editIconStyle={styles.smallEditIconAccount}
                    style={styles.w100}
                />
            </View>
            <MenuItemWithTopDescription
                title={groupName}
                onPress={navigateToEditChatName}
                shouldShowRightIcon
                shouldCheckActionAllowedOnPress={false}
                description={translate('newRoomPage.groupName')}
                wrapperStyle={[styles.ph4]}
            />
            <View style={[styles.flex1, styles.mt3]}>
                <SelectionList
                    data={selectedParticipants}
                    ListItem={InviteMemberListItem}
                    onSelectRow={unselectOption}
                    canSelectMultiple
                    confirmButtonOptions={{
                        showButton: !!selectedOptions.length,
                        text: translate('newChatPage.startGroup'),
                        onConfirm: createGroup,
                    }}
                    customListHeader={
                        <View style={[styles.mt8, styles.mb4, styles.justifyContentCenter]}>
                            <Text style={[styles.ph5, styles.textLabelSupporting]}>{translate('common.members')}</Text>
                        </View>
                    }
                />
            </View>
        </ScreenWrapper>
    );
}

NewChatConfirmPage.displayName = 'NewChatConfirmPage';

export default NewChatConfirmPage;
