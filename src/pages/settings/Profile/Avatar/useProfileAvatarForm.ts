import useAvatarCrop from '@hooks/useAvatarCrop';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDiscardChangesConfirmation from '@hooks/useDiscardChangesConfirmation';

import {USER_AVATARS} from '@libs/Avatars/UserAvatarCatalog';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import Navigation from '@libs/Navigation/Navigation';

import {deleteAvatar, updateAvatar} from '@userActions/PersonalDetails';

import type {TranslationPaths} from '@src/languages/types';

import {useRef, useState} from 'react';

import type {AvatarCaptureHandle} from './AvatarCapture/types';
import type {ErrorData, ImageData} from './types';

const EMPTY_FILE = {uri: '', name: '', type: '', file: null};

/** Owns the profile avatar form state (selection, picked image, validation errors) and the save flow. */
function useProfileAvatarForm() {
    const [errorData, setErrorData] = useState<ErrorData>({
        validationError: null,
        phraseParam: {},
    });
    const [selected, setSelected] = useState<string | undefined>();
    const [imageData, setImageData] = useState<ImageData>({...EMPTY_FILE});
    const [isRemoved, setIsRemoved] = useState(false);

    const avatarCaptureRef = useRef<AvatarCaptureHandle>(null);

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const isDirty = imageData.uri !== '' || !!selected || isRemoved;

    const {suppressDiscardPrompt} = useDiscardChangesConfirmation({
        getHasUnsavedChanges: () => isDirty,
    });

    const setError = (error: TranslationPaths | null, phraseParam: Record<string, unknown>) => {
        setErrorData({validationError: error, phraseParam});
    };

    const onImageSelected = (file: File | CustomRNImageManipulatorResult) => {
        setIsRemoved(false);
        setSelected(undefined);
        setImageData({
            uri: file?.uri ?? '',
            name: file?.name,
            file,
            type: '',
        });
    };

    const {openCropper} = useAvatarCrop({
        buttonLabelKey: 'avatarPage.upload',
        onCropped: onImageSelected,
    });

    const onSelectPreset = (id: string) => {
        setIsRemoved(false);
        setImageData({...EMPTY_FILE});
        setSelected(id);
    };

    const onImageRemoved = () => {
        setIsRemoved(true);
        setSelected(undefined);
        setImageData({...EMPTY_FILE});
    };

    const save = () => {
        suppressDiscardPrompt();

        if (isRemoved) {
            deleteAvatar(currentUserPersonalDetails);
            setIsRemoved(false);
            Navigation.dismissModal();
            return;
        }

        const previousAvatar = {
            avatar: currentUserPersonalDetails?.avatar,
            avatarThumbnail: currentUserPersonalDetails?.avatarThumbnail,
            accountID: currentUserPersonalDetails?.accountID,
        };

        if (imageData.file) {
            updateAvatar(imageData.file, previousAvatar);
            setImageData({...EMPTY_FILE});
            Navigation.dismissModal();
            return;
        }

        if (selected && USER_AVATARS.isAvatarID(selected)) {
            updateAvatar(
                {
                    uri: USER_AVATARS.getURL(selected) ?? '',
                    name: selected,
                    customExpensifyAvatarID: selected,
                },
                previousAvatar,
            );
            setSelected(undefined);
            Navigation.dismissModal();
            return;
        }

        if (!selected || !avatarCaptureRef.current) {
            suppressDiscardPrompt(false);
            return;
        }

        avatarCaptureRef.current
            .capture()
            ?.then((file) => {
                updateAvatar(file, previousAvatar);
                setSelected(undefined);
                setImageData({...EMPTY_FILE});
                Navigation.dismissModal();
            })
            .catch(() => {
                suppressDiscardPrompt(false);
            });
    };

    return {
        errorData,
        selected,
        imageData,
        avatarCaptureRef,
        isDirty,
        isRemoved,
        setError,
        onSelectPreset,
        onImageRemoved,
        openCropper,
        save,
    };
}

export default useProfileAvatarForm;
