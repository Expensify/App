import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type ContentTypes = ValueOf<typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES>;

type DismissReferralBannerParams = {
    type: ContentTypes;
};

export default DismissReferralBannerParams;
