import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import AttachmentPicker from '@components/AttachmentPicker';
import Avatar from '@components/Avatar';
import AvatarCropModal from '@components/AvatarCropModal/AvatarCropModal';
import AvatarSelector from '@components/AvatarSelector';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLetterAvatars from '@hooks/useLetterAvatars';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {validateAvatarImage} from '@libs/AvatarUtils';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import Navigation from '@libs/Navigation/Navigation';
import {isDefaultAvatar} from '@libs/UserUtils';
import {isValidAccountRoute} from '@libs/ValidationUtils';
import DiscardChangesConfirmation from '@pages/iou/request/step/DiscardChangesConfirmation';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import {deleteAvatar, openPublicProfilePage, updateAvatar} from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import AvatarCapture from './AvatarCapture';
import type {AvatarCaptureHandle} from './AvatarCapture/types';

const EMPTY_FILE = {uri: '', name: '', type: '', file: null};

type ImageData = {
    uri: string;
    name: string;
    type: string;
    file: File | CustomRNImageManipulatorResult | null;
};

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

    const [selected, setSelected] = useState<string | undefined>();
    const avatarCaptureRef = useRef<AvatarCaptureHandle>(null);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [imageData, setImageData] = useState<ImageData>({...EMPTY_FILE});
    const avatarStyle = [styles.avatarXLarge, styles.alignSelfStart, styles.alignSelfCenter];

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {avatarMap: avatars} = useLetterAvatars(currentUserPersonalDetails?.firstName, CONST.AVATAR_SIZE.X_LARGE);

    const accountID = currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    // eslint-disable-next-line no-nested-ternary
    const avatarURL = selected ? avatars[selected] : imageData.uri !== '' ? imageData.uri : (currentUserPersonalDetails?.avatar ?? '');
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
                    file: null,
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
    }, [accountID]);

    const onImageSelected = useCallback((file: File | CustomRNImageManipulatorResult) => {
        setSelected(undefined);
        setImageData({
            uri: file.uri ?? '',
            name: file.name,
            file,
            type: '',
        });
        setIsAvatarCropModalOpen(false);
    }, []);

    const onImageRemoved = useCallback(() => {
        deleteAvatar({
            avatar: currentUserPersonalDetails?.avatar,
            fallbackIcon: currentUserPersonalDetails?.fallbackIcon,
            accountID: currentUserPersonalDetails?.accountID,
        });
        Navigation.dismissModal();
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
            <HeaderWithBackButton title={translate('avatarPage.title')} />
            <View style={[styles.flexColumn, styles.gap6, styles.alignItemsCenter, styles.pb5]}>
                <AvatarCapture
                    ref={avatarCaptureRef}
                    name={selected ?? 'avatar'}
                >
                    <Avatar
                        containerStyles={avatarStyle}
                        imageStyles={avatarStyle}
                        source={avatarURL}
                        avatarID={accountID}
                        fallbackIcon={currentUserPersonalDetails?.fallbackIcon}
                        size={CONST.AVATAR_SIZE.X_LARGE}
                        type={CONST.ICON_TYPE_AVATAR}
                    />
                </AvatarCapture>
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
                                    text={translate('avatarPage.uploadPhoto')}
                                    accessibilityLabel={translate('avatarPage.uploadPhoto')}
                                    isDisabled={isAvatarCropModalOpen}
                                    onPress={() => {
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
                                isDisabled={isAvatarCropModalOpen}
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

            <ScrollView
                style={styles.flex1}
                contentContainerStyle={styles.flexGrow1}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.ph5, styles.flexColumn, styles.flex1, styles.gap2, styles.alignItemsCenter]}>
                    <AvatarSelector
                        name={currentUserPersonalDetails?.firstName ?? currentUserPersonalDetails?.displayName ?? ''}
                        selectedID={selected}
                        onSelect={(id) => {
                            setImageData({...EMPTY_FILE});
                            setSelected(id);
                        }}
                    />
                    {!!errorData.validationError && (
                        <DotIndicatorMessage
                            style={styles.mt6}
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            messages={{0: translate(errorData.validationError, errorData.phraseParam as never)}}
                            type="error"
                        />
                    )}
                </View>
            </ScrollView>
            <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                <Button
                    large
                    success
                    text={translate('common.save')}
                    isDisabled={!(!!imageData.uri || !!selected)}
                    onPress={() => {
                        if (imageData.file) {
                            updateAvatar(imageData.file, {
                                avatar: currentUserPersonalDetails?.avatar,
                                avatarThumbnail: currentUserPersonalDetails?.avatarThumbnail,
                                accountID: currentUserPersonalDetails?.accountID,
                            });
                            setImageData({...EMPTY_FILE});
                            Navigation.dismissModal();
                            return;
                        }
                        if (!selected || !avatarCaptureRef.current) {
                            return;
                        }

                        avatarCaptureRef.current
                            .capture()
                            .then((file) => {
                                updateAvatar(file, {
                                    avatar: currentUserPersonalDetails?.avatar,
                                    avatarThumbnail: currentUserPersonalDetails?.avatarThumbnail,
                                    accountID: currentUserPersonalDetails?.accountID,
                                });
                                setSelected(undefined);
                            })
                            .then(() => {
                                Navigation.dismissModal();
                            })
                            .catch((error) => {
                                // setError('avatarWithImagePicker.errorWhileSelectingImage', {});
                                // eslint-disable-next-line no-console
                                console.error('Error capturing avatar:', error);
                            });
                    }}
                    pressOnEnter
                />
            </FixedFooter>
            <DiscardChangesConfirmation getHasUnsavedChanges={() => !!imageData.uri || !!selected} />
            <AvatarCropModal
                onClose={() => {
                    if (!isAvatarCropModalOpen) {
                        return;
                    }
                    setIsAvatarCropModalOpen(false);
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
