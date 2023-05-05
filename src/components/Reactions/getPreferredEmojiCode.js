/**
 * Given an emoji object it returns the correct emoji code
 * based on the users preferred skin tone.
 * @param {Object} emoji
 * @param {String | Number} preferredSkinTone
 * @returns {String}
 */
export default function getPreferredEmojiCode(emoji, preferredSkinTone) {
    if (emoji.types) {
        const emojiCodeWithSkinTone = emoji.types[preferredSkinTone];

        // Note: it can happen that preferredSkinTone has a outdated format,
        // so it makes sense to check if we actually got a valid emoji code back
        if (emojiCodeWithSkinTone) {
            return emojiCodeWithSkinTone;
        }
    }

    return emoji.code;
}
