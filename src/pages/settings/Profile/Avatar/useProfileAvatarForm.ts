import {useRef, useState} from 'react';
import useAvatarCrop from '@hooks/useAvatarCrop';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDiscardChangesConfirmation from '@hooks/useDiscardChangesConfirmation';
import {USER_AVATARS} from '@libs/Avatars/UserAvatarCatalog';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import Navigation from '@libs/Navigation/Navigation';
import {updateAvatar} from '@userActions/PersonalDetails';
import type {TranslationPaths} from '@src/languages/types';
import type {AvatarCaptureHandle} from './AvatarCapture/types';
import type {ErrorData, ImageData} from './types';

const EMPTY_FILE = {uri: '', name: '', type: '', file: null};

/** Owns the profile avatar form state (selection, picked image, validation errors) and the save flow. */
function useProfileAvatarForm() {
    const [errorData, setErrorData] = useState<ErrorData>({validationError: null, phraseParam: {}});
    const [selected, setSelected] = useState<string | undefined>();
    const [imageData, setImageData] = useState<ImageData>({...EMPTY_FILE});

    const avatarCaptureRef = useRef<AvatarCaptureHandle>(null);
    const isSavingRef = useRef(false);

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const isDirty = imageData.uri !== '' || !!selected;

    useDiscardChangesConfirmation({
        getHasUnsavedChanges: () => !isSavingRef.current && isDirty,
    });

    const setError = (error: TranslationPaths | null, phraseParam: Record<string, unknown>) => {
        setErrorData({validationError: error, phraseParam});
    };

    const onImageSelected = (file: File | CustomRNImageManipulatorResult) => {
        setSelected(undefined);
        setImageData({
            uri: file?.uri ?? '',
            name: file?.name,
            file,
            type: '',
        });
    };

    const {openCropper} = useAvatarCrop({buttonLabelKey: 'avatarPage.upload', onCropped: onImageSelected});

    const onSelectPreset = (id: string) => {
        setImageData({...EMPTY_FILE});
        setSelected(id);
    };

    const save = () => {
        isSavingRef.current = true;

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
            isSavingRef.current = false;
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
                isSavingRef.current = false;
            });
    };

    return {
        errorData,
        selected,
        setSelected,
        imageData,
        setImageData,
        avatarCaptureRef,
        isDirty,
        setError,
        onSelectPreset,
        openCropper,
        save,
    };
}

export default useProfileAvatarForm;
