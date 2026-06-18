import {useCallback, useEffect, useRef} from 'react';
import {buildFileFromAvatarCropResult, clearAvatarCropDraft, clearAvatarCropResult, setAvatarCropDraft} from '@libs/actions/AvatarCrop';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import Navigation from '@libs/Navigation/Navigation';
import {rand64} from '@libs/NumberUtils';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {FileObject} from '@src/types/utils/Attachment';
import useOnyx from './useOnyx';

type UseAvatarCropParams = {
    /** Shape of the crop mask */
    maskType?: 'square' | 'circle';

    /** Translation key for the crop screen's primary action button */
    buttonLabelKey?: TranslationPaths;

    /** Called with the cropped image once the user saves on the crop screen */
    onCropped: (image: File | CustomRNImageManipulatorResult) => void;

    /**
     * Explicit crop route to navigate to. Used by openers whose route is dynamically composed
     * (report details, money request upgrade) where the contextual URL can't be derived safely.
     * When omitted, the route is derived from the active route as `<activeRoute>/crop`.
     * Typed as a plain string (rather than `Route`) to keep the huge `Route` union out of the
     * `useCallback` dependency array; callers still pass a typed `Route`.
     */
    cropRoute?: string;
};

/**
 * Builds the contextual crop route from the screen the user is currently on, e.g.
 * `settings/profile/avatar` -> `settings/profile/avatar/crop`.
 */
function getContextualCropRoute(): string | undefined {
    const base = Navigation.getActiveRouteWithoutParams().replace(/^\//, '').replace(/\/+$/, '');
    if (!base) {
        return undefined;
    }
    return `${base}/crop`;
}

/**
 * Opens the avatar crop screen for a picked image and hands the cropped result back to the opener.
 * The image is passed through Onyx (base64 on web, file URI on native) rather than route params,
 * since the binary result isn't serializable into navigation state.
 */
function useAvatarCrop({maskType, buttonLabelKey, onCropped, cropRoute}: UseAvatarCropParams) {
    const [result] = useOnyx(ONYXKEYS.AVATAR_CROP_RESULT);
    const tokenRef = useRef<string | null>(null);

    const openCropper = useCallback(
        (image: FileObject) => {
            const token = rand64();
            tokenRef.current = token;
            const cropDestination = cropRoute ?? getContextualCropRoute() ?? ROUTES.AVATAR_CROP;
            setAvatarCropDraft({token, image, maskType, buttonLabelKey}).then(() => {
                // cropDestination is a runtime-built contextual route string (e.g. `settings/profile/avatar/crop`)
                // registered in the AvatarCrop stack, so it's a valid Route despite being assembled at runtime.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                Navigation.navigate(cropDestination as Route);
            });
        },
        [maskType, buttonLabelKey, cropRoute],
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
