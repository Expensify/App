import {useEffect, useRef} from 'react';
import {buildFileFromAvatarCropResult, clearAvatarCropResult, setAvatarCropDraft} from '@libs/actions/AvatarCrop';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {rand64} from '@libs/NumberUtils';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {AvatarCropMaskType} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import useOnyx from './useOnyx';

type UseAvatarCropParams = {
    /** Shape of the crop mask */
    maskType?: AvatarCropMaskType;

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

    const openCropper = (image: FileObject) => {
        const token = rand64();
        tokenRef.current = token;
        setAvatarCropDraft({token, image, maskType, buttonLabelKey}).then(() => {
            // Append `/avatar-crop` to the current route so the crop screen's URL reflects its context
            // (e.g. `settings/profile/avatar/avatar-crop`). Resolved via the dynamic-route machinery,
            // which validates entryScreens and avoids the cross-stack path resolution that NOT_FOUNDs.
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.AVATAR_CROP.path));
        });
    };

    useEffect(() => {
        if (!result || result.token !== tokenRef.current) {
            return;
        }
        tokenRef.current = null;
        const image = buildFileFromAvatarCropResult(result);
        // Only clear the result we consume here. The draft is owned by the crop screen (cleared on its
        // unmount); clearing it here would null it while the crop screen is still mounted and re-trigger
        // its missing-draft guard, popping the RHP underneath too.
        clearAvatarCropResult();
        onCropped(image);
    }, [result, onCropped]);

    return {openCropper};
}

export default useAvatarCrop;
