import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';

import {containsCustomEmoji} from '@libs/CustomEmojiUtils';

import FontUtils from '@styles/utils/FontUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';

import {delegateEmailSelector} from '@selectors/Account';
import {Skia} from '@shopify/react-native-skia';
import {useEffect, useState} from 'react';
import {Image} from 'react-native';

import type {TabIconEmojiStatus} from './tabIconRasterizer';

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- require() of a bundled asset is untyped. Metro resolves it to an asset ID.
const CUSTOM_EMOJI_FONT = require('@assets/fonts/native/CustomEmojiNativeFont.ttf') as number;

/** Held outside any component, so the font is read from disk once and a remounted navigator reuses it. */
let loadedCustomEmojiFontManager: SkTypefaceFontProvider | undefined;

/**
 * The current user's status emoji for the account tab icon, as the JS tab bar badges it: not while acting as a
 * delegate, because the delegate avatar takes its place there. Skia's system fonts have no glyph for our private use
 * area emojis, so those wait for the custom emoji font to load rather than draw a blank badge.
 */
function useTabEmojiStatus(): TabIconEmojiStatus | undefined {
    const theme = useTheme();
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const emojiCode = useCurrentUserPersonalDetails().status?.emojiCode;
    const isCustomEmoji = containsCustomEmoji(emojiCode);
    const [customEmojiFontManager, setCustomEmojiFontManager] = useState(loadedCustomEmojiFontManager);

    useEffect(() => {
        if (!isCustomEmoji || customEmojiFontManager) {
            return;
        }
        let isActive = true;
        Skia.Data.fromURI(Image.resolveAssetSource(CUSTOM_EMOJI_FONT).uri)
            .then((data) => {
                const typeface = Skia.Typeface.MakeFreeTypeFaceFromData(data);
                data.dispose();
                if (!typeface) {
                    return;
                }
                const fontManager = Skia.TypefaceFontProvider.Make();
                fontManager.registerFont(typeface, FontUtils.fontFamily.single.CUSTOM_EMOJI_FONT.fontFamily);
                loadedCustomEmojiFontManager = fontManager;
                if (isActive) {
                    setCustomEmojiFontManager(fontManager);
                }
            })
            // A failed load keeps the badge off.
            .catch(() => undefined);
        return () => {
            isActive = false;
        };
    }, [isCustomEmoji, customEmojiFontManager]);

    if (!emojiCode || delegateEmail || (isCustomEmoji && !customEmojiFontManager)) {
        return undefined;
    }
    return {emoji: emojiCode, backgroundColor: theme.border, fontManager: isCustomEmoji ? customEmojiFontManager : undefined};
}

export default useTabEmojiStatus;
