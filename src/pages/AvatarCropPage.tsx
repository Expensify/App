import React, {useEffect} from 'react';
import AvatarCropView from '@components/AvatarCropModal/AvatarCropView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearAvatarCropDraft, setAvatarCropResult} from '@libs/actions/AvatarCrop';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function AvatarCropPage() {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ImageCropSquareMask']);
    const [draft, draftMetadata] = useOnyx(ONYXKEYS.AVATAR_CROP_DRAFT);
    const isLoadingDraft = isLoadingOnyxValue(draftMetadata);
    // The image is base64-persisted, so it survives a refresh and the cropper can re-render. The opener
    // re-adopts the draft's token on mount (see useAvatarCrop), so a save still reaches it.
    const hasCropImage = !!draft?.uri;

    // Dismiss only when there's genuinely nothing to crop. Wait for navigation to be ready: on a cold web
    // refresh this effect can fire before the navigation container is initialized, in which case a bare
    // goBack() is dropped and the loader hangs forever.
    useEffect(() => {
        if (isLoadingDraft || hasCropImage) {
            return;
        }
        Navigation.isNavigationReady().then(() => Navigation.goBack());
    }, [isLoadingDraft, hasCropImage]);

    // Make sure the input draft is cleaned up no matter how the screen is left (back gesture, hardware back, save).
    useEffect(
        () => () => {
            clearAvatarCropDraft();
        },
        [],
    );

    if (isLoadingDraft || !draft?.uri) {
        return (
            <FullScreenLoadingIndicator
                shouldUseGoBackButton
                reasonAttributes={{context: 'AvatarCropPage'}}
            />
        );
    }

    const onSave = (image: File | CustomRNImageManipulatorResult) => {
        setAvatarCropResult({token: draft.token, image}).then(() => {
            Navigation.goBack();
        });
    };

    return (
        <AvatarCropView
            imageUri={draft.uri}
            imageName={draft.name}
            imageType={draft.type}
            maskImage={draft.maskType === 'square' ? icons.ImageCropSquareMask : undefined}
            buttonLabel={draft.buttonLabelKey ? translate(draft.buttonLabelKey) : undefined}
            onSave={onSave}
            onClose={() => Navigation.goBack()}
        />
    );
}

export default AvatarCropPage;
