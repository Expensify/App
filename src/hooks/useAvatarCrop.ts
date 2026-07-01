import {useEffect, useRef} from 'react';
import {clearAvatarCropResult, setAvatarCropDraft} from '@libs/actions/AvatarCrop';
import {buildFileFromAvatarCropResult} from '@libs/AvatarCropUtils';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import splitPathAndQuery from '@libs/Navigation/helpers/dynamicRoutesUtils/splitPathAndQuery';
import Navigation from '@libs/Navigation/Navigation';
import {rand64} from '@libs/NumberUtils';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {AvatarCropMaskType} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import useOnyx from './useOnyx';

const CROP_SUFFIX = `/${DYNAMIC_ROUTES.AVATAR_CROP.path}`;

/** The opener's route, used to tie a persisted crop draft back to the opener that started it. */
function getOpenerKey(route: string): string {
    return splitPathAndQuery(route).at(0) ?? '';
}

type UseAvatarCropParams = {
    /** Shape of the crop mask */
    maskType?: AvatarCropMaskType;

    /** Translation key for the crop screen's primary action button */
    buttonLabelKey?: TranslationPaths;

    /** Called with the cropped image once the user saves on the crop screen */
    onCropped: (image: File | CustomRNImageManipulatorResult) => void;
};

/** Opens the avatar crop screen for a picked image and hands the cropped result back to the opener. */
function useAvatarCrop({maskType, buttonLabelKey, onCropped}: UseAvatarCropParams) {
    const [draft] = useOnyx(ONYXKEYS.AVATAR_CROP_DRAFT);
    const [result] = useOnyx(ONYXKEYS.AVATAR_CROP_RESULT);
    const tokenRef = useRef<string | null>(null);

    const openCropper = (image: FileObject) => {
        const token = rand64();
        tokenRef.current = token;
        // Capture the opener's route now: serialization below is async (slow on web) and the active
        // route can change if the user navigates away before it resolves.
        const baseRoute = Navigation.getActiveRoute();
        setAvatarCropDraft({token, image, openerKey: getOpenerKey(baseRoute), maskType, buttonLabelKey}).then(() => {
            // Abort if the opener unmounted or started a newer crop while serializing — navigating now
            // would yank the user back or open the crop screen under a disallowed entry screen.
            if (tokenRef.current !== token) {
                return;
            }
            // Append `/avatar-crop` to the opener's route so the crop screen opens under its context.
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.AVATAR_CROP.path, baseRoute));
        });
    };

    // After a page refresh the in-memory token is gone but the persisted draft survives. Re-adopt the
    // draft's token if it was opened from this opener's route (the focused crop route minus the
    // `/avatar-crop` suffix), so the cropped result is still delivered to this opener when the user saves.
    useEffect(() => {
        if (tokenRef.current || !draft?.token || !draft.openerKey) {
            return;
        }
        const focusedPath = splitPathAndQuery(Navigation.getActiveRoute()).at(0) ?? '';
        const openerPath = focusedPath.endsWith(CROP_SUFFIX) ? focusedPath.slice(0, -CROP_SUFFIX.length) : focusedPath;
        if (openerPath !== draft.openerKey) {
            return;
        }
        tokenRef.current = draft.token;
    }, [draft?.token, draft?.openerKey]);

    useEffect(() => {
        if (!result || result.token !== tokenRef.current) {
            return;
        }
        tokenRef.current = null;
        const image = buildFileFromAvatarCropResult(result);
        // Clear only the result; the draft is owned (and cleared) by the crop screen on unmount.
        clearAvatarCropResult();
        onCropped(image);
    }, [result, onCropped]);

    // Cancel any in-flight crop on unmount; the pending `.then()` checks the token and skips navigation.
    useEffect(
        () => () => {
            tokenRef.current = null;
        },
        [],
    );

    return {openCropper};
}

export default useAvatarCrop;
