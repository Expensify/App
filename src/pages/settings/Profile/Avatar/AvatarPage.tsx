import React, {useCallback, useRef, useState} from 'react';
import {View} from 'react-native';
import AttachmentPicker from '@components/AttachmentPicker';
import Avatar from '@components/Avatar';
import AvatarCropModal from '@components/AvatarCropModal/AvatarCropModal';
import AvatarSelector from '@components/AvatarSelector';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useAvatarMenu from '@hooks/useAvatarMenu';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLetterAvatars from '@hooks/useLetterAvatars';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getAvatarLocal, getAvatarURL, isPresetAvatarID} from '@libs/Avatars/PresetAvatarCatalog';
import {validateAvatarImage} from '@libs/AvatarUtils';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import Navigation from '@libs/Navigation/Navigation';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import {getDefaultAvatarName, isLetterAvatar, isPresetAvatar} from '@libs/UserAvatarUtils';
import DiscardChangesConfirmation from '@pages/iou/request/step/DiscardChangesConfirmation';
import {updateAvatar} from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {FileObject} from '@src/types/utils/Attachment';
import AvatarCapture from './AvatarCapture';
import type {AvatarCaptureHandle} from './AvatarCapture/types';

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

const EMPTY_FILE = {uri: '', name: '', type: '', file: null};

function ProfileAvatar() {
    const [errorData, setErrorData] = useState<ErrorData>({validationError: null, phraseParam: {}});
    const [isAvatarCropModalOpen, setIsAvatarCropModalOpen] = useState(false);

    const [selected, setSelected] = useState<string | undefined>();
    const avatarCaptureRef = useRef<AvatarCaptureHandle>(null);
    const isSavingRef = useRef(false);

    const icons = useMemoizedLazyExpensifyIcons(['Upload'] as const);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [cropImageData, setCropImageData] = useState<ImageData>({...EMPTY_FILE});
    const [imageData, setImageData] = useState<ImageData>({...EMPTY_FILE});

    const isDirty = imageData.uri !== '' || !!selected;

    const avatarStyle = [styles.avatarXLarge, styles.alignSelfStart, styles.alignSelfCenter];

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {avatarMap: avatars} = useLetterAvatars(currentUserPersonalDetails?.displayName, CONST.AVATAR_SIZE.X_LARGE);

    const accountID = currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    // eslint-disable-next-line no-nested-ternary
    let avatarURL: AvatarSource = '';
    if (selected && isPresetAvatarID(selected)) {
        avatarURL = getAvatarLocal(selected);
    } else if (selected) {
        avatarURL = avatars[selected];
    } else if (imageData.uri) {
        avatarURL = imageData.uri;
    } else {
        avatarURL = currentUserPersonalDetails?.avatar ?? '';
    }
    // Weather avatar view & edit options should be hidden. False if user uploaded their own avatar.
    const shouldHideAvatarEdit = (!imageData.uri && (isPresetAvatar(currentUserPersonalDetails?.avatar) || isLetterAvatar(currentUserPersonalDetails?.originalFileName))) || !!selected;

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
                setCropImageData({
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

    const onImageSelected = useCallback((file: File | CustomRNImageManipulatorResult) => {
        setSelected(undefined);
        setImageData({
            uri: file?.uri ?? '',
            name: file?.name,
            file,
            type: '',
        });
        setIsAvatarCropModalOpen(false);
    }, []);

    const onImageRemoved = useCallback(() => {
        setSelected(
            getDefaultAvatarName({
                accountID: currentUserPersonalDetails?.accountID,
                accountEmail: currentUserPersonalDetails?.email,
            }),
        );
        setImageData({...EMPTY_FILE});
    }, [currentUserPersonalDetails?.accountID, currentUserPersonalDetails?.email]);

    const clearError = useCallback(() => {
        setError(null, {});
    }, []);

    const {createMenuItems} = useAvatarMenu({
        shouldHideAvatarEdit,
        accountID,
        onImageRemoved,
        showAvatarCropModal,
        clearError,
        source: imageData.uri,
        originalFileName: imageData.name,
    });

    const onPress = useCallback(() => {
        isSavingRef.current = true;

        if (imageData.file) {
            updateAvatar(imageData.file, {
                avatar: currentUserPersonalDetails?.avatar,
                avatarThumbnail: currentUserPersonalDetails?.avatarThumbnail,
                accountID: currentUserPersonalDetails?.accountID,
            });
            setImageData({...EMPTY_FILE});
            Navigation.dismissModal();
            isSavingRef.current = false;
            return;
        }

        if (selected && isPresetAvatarID(selected)) {
            updateAvatar(
                {
                    uri: getAvatarURL(selected),
                    name: selected,
                    customExpensifyAvatarID: selected,
                },
                {
                    avatar: currentUserPersonalDetails?.avatar,
                    avatarThumbnail: currentUserPersonalDetails?.avatarThumbnail,
                    accountID: currentUserPersonalDetails?.accountID,
                },
            );
            setSelected(undefined);
            Navigation.dismissModal();
            isSavingRef.current = false;
            return;
        }
        if (!selected || !avatarCaptureRef.current) {
            isSavingRef.current = false;
            return;
        }
        // User selected a letter avatar
        avatarCaptureRef.current.capture()?.then((file) => {
            updateAvatar(file, {
                avatar: currentUserPersonalDetails?.avatar,
                avatarThumbnail: currentUserPersonalDetails?.avatarThumbnail,
                accountID: currentUserPersonalDetails?.accountID,
            });
            setSelected(undefined);
            setImageData({...EMPTY_FILE});
            Navigation.dismissModal();
            isSavingRef.current = false;
        });
    }, [currentUserPersonalDetails?.accountID, currentUserPersonalDetails?.avatar, currentUserPersonalDetails?.avatarThumbnail, imageData.file, selected]);

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
            <View style={[styles.flexColumn, styles.gap5, styles.alignItemsCenter, styles.pb10]}>
                <AvatarCapture
                    ref={avatarCaptureRef}
                    fileName={selected ?? 'avatar'}
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
                        const menuItems = createMenuItems(openPicker);
                        if (menuItems?.length <= 1) {
                            return (
                                <Button
                                    icon={icons.Upload}
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
                                options={menuItems}
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
                <View style={[styles.ph5, styles.pb5, styles.flexColumn, styles.flex1, styles.gap3]}>
                    <AvatarSelector
                        label={translate('avatarPage.choosePresetAvatar')}
                        name={currentUserPersonalDetails?.displayName}
                        selectedID={selected}
                        onSelect={(id) => {
                            setImageData({...EMPTY_FILE});
                            setSelected(id);
                        }}
                    />
                </View>
            </ScrollView>
            <FixedFooter style={styles.mtAuto}>
                {!!errorData.validationError && (
                    <DotIndicatorMessage
                        style={styles.mv5}
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        messages={{0: translate(errorData.validationError, errorData.phraseParam as never)}}
                        type="error"
                    />
                )}
                <Button
                    large
                    success
                    text={translate('common.save')}
                    isDisabled={!isDirty}
                    onPress={onPress}
                    pressOnEnter
                />
            </FixedFooter>
            <AvatarCropModal
                onClose={() => {
                    if (!isAvatarCropModalOpen) {
                        return;
                    }
                    setCropImageData({...EMPTY_FILE});
                    setIsAvatarCropModalOpen(false);
                }}
                isVisible={isAvatarCropModalOpen}
                onSave={onImageSelected}
                imageUri={cropImageData.uri}
                imageName={cropImageData.name}
                imageType={cropImageData.type}
                buttonLabel={translate('avatarPage.upload')}
            />
            <DiscardChangesConfirmation getHasUnsavedChanges={() => !isSavingRef.current && isDirty} />
        </ScreenWrapper>
    );
}

ProfileAvatar.displayName = 'ProfileAvatar';

export default ProfileAvatar;
