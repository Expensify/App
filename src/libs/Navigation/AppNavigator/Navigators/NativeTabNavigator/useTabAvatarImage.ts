import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';

import {getAvatarURL} from '@libs/UserAvatarUtils';

import type {SkImage} from '@shopify/react-native-skia';

import {Skia} from '@shopify/react-native-skia';
import {useEffect, useState} from 'react';

type TabAvatarImage = {uri: string; image: SkImage};

/** Held outside any component, so a status or theme redraw and a remounted navigator reuse the decoded avatar. */
let lastDecodedAvatar: TabAvatarImage | undefined;

/**
 * The current user's avatar, decoded once per URI for the account tab icon while that icon is shown. Until it is
 * decoded, and for avatars that are not a remote image, the account glyph stands in.
 */
function useTabAvatarImage(isShown: boolean): TabAvatarImage | undefined {
    const {avatar, accountID} = useCurrentUserPersonalDetails();
    const avatarSource = getAvatarURL({avatarSource: avatar, accountID});
    const uri = typeof avatarSource === 'string' ? avatarSource : undefined;
    const [decodedAvatar, setDecodedAvatar] = useState(lastDecodedAvatar);
    const decodedUri = decodedAvatar?.uri;

    useEffect(() => {
        if (!isShown || !uri || decodedUri === uri) {
            return;
        }
        let isActive = true;
        Skia.Data.fromURI(uri)
            .then((data) => {
                const image = Skia.Image.MakeImageFromEncoded(data);
                data.dispose();
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
    }, [isShown, uri, decodedUri]);

    return decodedAvatar?.uri === uri ? decodedAvatar : undefined;
}

export default useTabAvatarImage;
export type {TabAvatarImage};
