import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import AttachmentPicker from '@components/AttachmentPicker';
import Avatar from '@components/Avatar';
import AvatarCropModal from '@components/AvatarCropModal/AvatarCropModal';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {validateAvatarImage} from '@libs/AvatarUtils';
import {isSafari} from '@libs/Browser';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import Navigation from '@libs/Navigation/Navigation';
import {isDefaultAvatar} from '@libs/UserUtils';
import {isValidAccountRoute} from '@libs/ValidationUtils';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import {deleteAvatar, openPublicProfilePage, updateAvatar} from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

type ErrorData = {
    validationError?: TranslationPaths | null | '';
    phraseParam: Record<string, unknown>;
};

type OpenPickerParams = {
    onPicked: (image: FileObject[]) => void;
};
type OpenPicker = (args: OpenPickerParams) => void;

function ProfileAvatar() {
    const [errorData, setErrorData] = useState<ErrorData>({validationError: null, phraseParam: {}});
    const [isAvatarCropModalOpen, setIsAvatarCropModalOpen] = useState(false);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [imageData, setImageData] = useState({
        uri: '',
        name: '',
        type: '',
    });
    const avatarStyle = [styles.avatarXLarge, styles.alignSelfStart, styles.alignSelfCenter];

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const accountID = currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const avatarURL = currentUserPersonalDetails?.avatar ?? '';
    const isUsingDefaultAvatar = isDefaultAvatar(currentUserPersonalDetails?.avatar ?? '');

    const setError = (error: TranslationPaths | null, phraseParam: Record<string, unknown>) => {
        setErrorData({
            validationError: error,
            phraseParam,
        });
    };

    /**
     * Validates an image and opens avatar crop modal if valid
     */
    const showAvatarCropModal = useCallback((image: FileObject) => {
        validateAvatarImage(image)
            .then((validationResult) => {
                if (!validationResult.isValid) {
                    setError(validationResult.errorKey ?? null, validationResult.errorParams ?? {});
                    return;
                }

                setIsAvatarCropModalOpen(true);
                setError(null, {});
                setImageData({
                    uri: image.uri ?? '',
                    name: image.name ?? '',
                    type: image.type ?? '',
                });
            })
            .catch(() => {
                setError('attachmentPicker.errorWhileSelectingCorruptedAttachment', {});
            });
    }, []);

    useEffect(() => {
        if (!isValidAccountRoute(Number(accountID))) {
            return;
        }
        openPublicProfilePage(accountID);
    }, [accountID, avatarURL]);

    const onImageSelected = useCallback(
        (file: File | CustomRNImageManipulatorResult) => {
            updateAvatar(file, {
                avatar: currentUserPersonalDetails?.avatar,
                avatarThumbnail: currentUserPersonalDetails?.avatarThumbnail,
                accountID: currentUserPersonalDetails?.accountID,
            });
        },
        [currentUserPersonalDetails],
    );

    const onImageRemoved = useCallback(() => {
        deleteAvatar({
            avatar: currentUserPersonalDetails?.avatar,
            fallbackIcon: currentUserPersonalDetails?.fallbackIcon,
            accountID: currentUserPersonalDetails?.accountID,
        });
    }, [currentUserPersonalDetails]);

    /**
     * Create menu items list for avatar menu
     */
    const createMenuItems = useCallback(
        (openPicker: OpenPicker): Array<DropdownOption<null>> => {
            const menuItems: Array<DropdownOption<null>> = [
                {
                    icon: Expensicons.Upload,
                    text: translate('avatarWithImagePicker.uploadPhoto'),
                    onSelected: () => {
                        if (isSafari()) {
                            return;
                        }
                        openPicker({
                            onPicked: (data) => showAvatarCropModal(data.at(0) ?? {}),
                        });
                    },
                    value: null,
                },
            ];

            // If current avatar isn't a default avatar, allow Remove Photo option
            if (isUsingDefaultAvatar) {
                return menuItems;
            }
            return [
                ...menuItems,
                {
                    icon: Expensicons.Trashcan,
                    text: translate('avatarWithImagePicker.removePhoto'),
                    value: null,

                    onSelected: () => {
                        setError(null, {});
                        onImageRemoved();
                    },
                },
                {
                    value: null,
                    icon: Expensicons.Eye,
                    text: translate('avatarWithImagePicker.viewPhoto'),
                    onSelected: () => Navigation.navigate(ROUTES.PROFILE_AVATAR.getRoute(accountID)),
                },
            ];
        },
        [accountID, isUsingDefaultAvatar, onImageRemoved, showAvatarCropModal, translate],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            includePaddingTop
            shouldEnableMaxHeight
            testID={ProfileAvatar.displayName}
            offlineIndicatorStyle={styles.mtAuto}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton title="Edit profile picture" />

            <ScrollView
                style={[styles.w100, styles.h100, styles.flex1]}
                contentContainerStyle={styles.flexGrow1}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.flexColumn, styles.flex1, styles.gap6, styles.alignItemsCenter]}>
                    <Avatar
                        containerStyles={avatarStyle}
                        imageStyles={avatarStyle}
                        source={avatarURL}
                        avatarID={accountID}
                        fallbackIcon={currentUserPersonalDetails?.fallbackIcon}
                        size={CONST.AVATAR_SIZE.X_LARGE}
                        type={CONST.ICON_TYPE_AVATAR}
                    />
                    <AttachmentPicker
                        type={CONST.ATTACHMENT_PICKER_TYPE.IMAGE}
                        // We need to skip the validation in AttachmentPicker because it is handled in this component itself
                        shouldValidateImage={false}
                    >
                        {({openPicker}) => {
                            if (isUsingDefaultAvatar) {
                                return (
                                    <Button
                                        icon={Expensicons.Upload}
                                        text="Upload a photo"
                                        onPress={() => {
                                            if (isSafari()) {
                                                return;
                                            }
                                            openPicker({
                                                onPicked: (data) => showAvatarCropModal(data.at(0) ?? {}),
                                            });
                                        }}
                                    />
                                );
                            }

                            return (
                                <ButtonWithDropdownMenu
                                    success={false}
                                    shouldUseOptionIcon
                                    onPress={() => {}}
                                    anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                                    customText={translate('common.edit')}
                                    options={createMenuItems(openPicker)}
                                    isSplitButton={false}
                                />
                            );
                        }}
                    </AttachmentPicker>
                </View>
            </ScrollView>
            {!!errorData.validationError && (
                <DotIndicatorMessage
                    style={styles.mt6}
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    messages={{0: translate(errorData.validationError, errorData.phraseParam as never)}}
                    type="error"
                />
            )}
            <AvatarCropModal
                onClose={() => {
                    setIsAvatarCropModalOpen(false);
                    Navigation.dismissModal();
                }}
                isVisible={isAvatarCropModalOpen}
                onSave={onImageSelected}
                imageUri={imageData.uri}
                imageName={imageData.name}
                imageType={imageData.type}
            />
        </ScreenWrapper>
    );
}

ProfileAvatar.displayName = 'ProfileAvatar';

export default ProfileAvatar;
