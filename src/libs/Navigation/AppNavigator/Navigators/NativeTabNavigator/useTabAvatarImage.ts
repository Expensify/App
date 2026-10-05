import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';

import {getAvatarURL} from '@libs/UserAvatarUtils';

import type {SkImage} from '@shopify/react-native-skia';

import {Skia} from '@shopify/react-native-skia';
import {useEffect, useState} from 'react';

type TabAvatarImage = {uri: string; image: SkImage};

/** Held outside any component, so a status or theme redraw and a remounted navigator reuse the decoded avatar. */
let lastDecodedAvatar: TabAvatarImage | undefined;

/**
 * The current user's avatar, decoded once per URI for the account tab icon. Until it is decoded, and for avatars that
 * are not a remote image, the account glyph stands in.
 */
function useTabAvatarImage(): TabAvatarImage | undefined {
    const {avatar, accountID} = useCurrentUserPersonalDetails();
    const avatarSource = getAvatarURL({avatarSource: avatar, accountID});
    const uri = typeof avatarSource === 'string' ? avatarSource : undefined;
    const [decodedAvatar, setDecodedAvatar] = useState(lastDecodedAvatar);

    useEffect(() => {
        if (!uri || decodedAvatar?.uri === uri) {
            return;
        }
        let isActive = true;
        Skia.Data.fromURI(uri)
            .then((data) => {
                const image = Skia.Image.MakeImageFromEncoded(data);
                if (!image) {
                    return;
                }
                lastDecodedAvatar = {uri, image};
                if (isActive) {
                    setDecodedAvatar(lastDecodedAvatar);
                }
            })
            // A failed decode keeps the account glyph.
            .catch(() => undefined);
        return () => {
            isActive = false;
        };
        // Only a new URI needs decoding; the decoded avatar is compared to skip one that is already decoded.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uri]);

    return decodedAvatar?.uri === uri ? decodedAvatar : undefined;
}

export default useTabAvatarImage;
