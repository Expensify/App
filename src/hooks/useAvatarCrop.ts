import {useCallback, useEffect, useRef} from 'react';
import {buildFileFromAvatarCropResult, clearAvatarCropDraft, clearAvatarCropResult, setAvatarCropDraft} from '@libs/actions/AvatarCrop';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import Navigation from '@libs/Navigation/Navigation';
import {rand64} from '@libs/NumberUtils';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {FileObject} from '@src/types/utils/Attachment';
import useOnyx from './useOnyx';

type UseAvatarCropParams = {
    /** Shape of the crop mask */
    maskType?: 'square' | 'circle';

    /** Translation key for the crop screen's primary action button */
    buttonLabelKey?: TranslationPaths;

    /** Called with the cropped image once the user saves on the crop screen */
    onCropped: (image: File | CustomRNImageManipulatorResult) => void;
};

/**
 * Opens the avatar crop screen for a picked image and hands the cropped result back to the opener.
 * The image is passed through Onyx (base64 on web, file URI on native) rather than route params,
 * since the binary result isn't serializable into navigation state.
 */
function useAvatarCrop({maskType, buttonLabelKey, onCropped}: UseAvatarCropParams) {
    const [result] = useOnyx(ONYXKEYS.AVATAR_CROP_RESULT);
    const tokenRef = useRef<string | null>(null);

    const openCropper = useCallback(
        (image: FileObject) => {
            const token = rand64();
            tokenRef.current = token;
            setAvatarCropDraft({token, image, maskType, buttonLabelKey}).then(() => {
                Navigation.navigate(ROUTES.AVATAR_CROP);
            });
        },
        [maskType, buttonLabelKey],
    );

    useEffect(() => {
        if (!result || result.token !== tokenRef.current) {
            return;
        }
        tokenRef.current = null;
        const image = buildFileFromAvatarCropResult(result);
        clearAvatarCropResult();
        clearAvatarCropDraft();
        onCropped(image);
    }, [result, onCropped]);

    return {openCropper};
}

export default useAvatarCrop;
