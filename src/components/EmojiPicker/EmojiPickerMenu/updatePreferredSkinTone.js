import * as User from '@userActions/User';

/**
 * @param {Number} preferredSkinTone
 * @param {Number} skinTone
 */
const updatePreferredSkinTone = (preferredSkinTone, skinTone) => {
    if (Number(preferredSkinTone) === Number(skinTone)) {
        return;
    }

    User.updatePreferredSkinTone(skinTone);
};

export default updatePreferredSkinTone;
