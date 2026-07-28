import type CONST from '@src/CONST';

/** Model of dismissed referral banners */
type DismissedReferralBanners = {
    /** Is 'Submit expense' referral dismissed */
    [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]?: boolean;

    /** Is 'Start chat' referral dismissed */
    [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]?: boolean;

    /** Is 'Refer friend' referral dismissed */
    [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]?: boolean;

    /** Is 'Share code' referral dismissed */
    [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]?: boolean;
};

export default DismissedReferralBanners;
