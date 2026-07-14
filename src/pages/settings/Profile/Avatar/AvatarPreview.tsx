import AttachmentPicker from '@components/AttachmentPicker';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';

import useAvatarMenu from '@hooks/useAvatarMenu';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLetterAvatars from '@hooks/useLetterAvatars';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {USER_AVATARS} from '@libs/Avatars/UserAvatarCatalog';
import {validateAvatarImage} from '@libs/AvatarUtils';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import {getDefaultAvatarURL, isCatalogAvatar, isGeneratedLetterAvatarURL, isLetterAvatar} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {FileObject} from '@src/types/utils/Attachment';

import React from 'react';
import {View} from 'react-native';

import type {AvatarCaptureHandle} from './AvatarCapture/types';

import AvatarCapture from './AvatarCapture';

type AvatarPreviewProps = {
    /** The selected avatar ID */
    selected: string | undefined;
    /** Whether the current avatar is staged for removal */
    isRemoved: boolean;
    /** Callback when the current avatar photo is removed */
    onImageRemoved: () => void;
    /** The ref to the avatar capture component */
    avatarCaptureRef: React.RefObject<AvatarCaptureHandle | null>;
    /** The image data */
    imageData: ImageData;
    /** The function to set the error */
    setError: (error: TranslationPaths | null, phraseParam: Record<string, unknown>) => void;
    /** Opens the avatar crop screen for the picked image */
    openCropper: (image: FileObject) => void;
};

type ImageData = {
    uri: string;
    name: string;
    type: string;
    file: File | CustomRNImageManipulatorResult | null;
};

function AvatarPreview({selected, isRemoved, onImageRemoved, avatarCaptureRef, imageData, setError, openCropper}: AvatarPreviewProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Upload']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const avatarStyle = [styles.avatarXLarge, styles.alignSelfStart, styles.alignSelfCenter];

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {avatarMap: avatars} = useLetterAvatars(currentUserPersonalDetails?.displayName, CONST.AVATAR_SIZE.X_LARGE);

    const accountID = currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID;

    let avatarURL: AvatarSource = '';
    if (selected && USER_AVATARS.isAvatarID(selected)) {
        avatarURL = USER_AVATARS.getLocal(selected) ?? '';
    } else if (selected) {
        avatarURL = avatars[selected];
    } else if (imageData.uri) {
        avatarURL = imageData.uri;
    } else if (isRemoved) {
        avatarURL = getDefaultAvatarURL({
            accountID,
            accountEmail: currentUserPersonalDetails?.email,
        });
    } else {
        avatarURL = currentUserPersonalDetails?.avatar ?? '';
    }
    // Whether avatar view & edit options should be hidden. False if user uploaded their own avatar.
    const shouldHideAvatarEdit =
        (!imageData.uri &&
            (isCatalogAvatar(currentUserPersonalDetails?.avatar) ||
                isGeneratedLetterAvatarURL(currentUserPersonalDetails?.avatar) ||
                isLetterAvatar(currentUserPersonalDetails?.originalFileName))) ||
        !!selected ||
        isRemoved;

    /**
     * Validates an image and opens avatar crop modal if valid
     */
    const showAvatarCropModal = (image: FileObject) => {
        validateAvatarImage(image)
            .then((validationResult) => {
                if (!validationResult.isValid) {
                    setError(validationResult.errorKey ?? null, validationResult.errorParams ?? {});
                    return;
                }

                setError(null, {});
                openCropper(image);
            })
            .catch(() => {
                setError('attachmentPicker.errorWhileSelectingCorruptedAttachment', {});
            });
    };

    const clearError = () => {
        setError(null, {});
    };

    const {createMenuItems} = useAvatarMenu({
        shouldHideAvatarEdit,
        accountID,
        onImageRemoved,
        showAvatarCropModal,
        clearError,
        source: imageData.uri,
        originalFileName: imageData.name,
    });

    return (
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
                            shouldUseOptionIcon
                            onPress={() => {}}
                            anchorAlignment={{
                                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
                                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                            }}
                            customText={translate('common.edit')}
                            options={menuItems}
                            isSplitButton={false}
                        />
                    );
                }}
            </AttachmentPicker>
        </View>
    );
}

export default AvatarPreview;
