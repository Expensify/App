import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type ContentTypes = ValueOf<typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES>;

type DismissReferralBannerParams = {
    type: ContentTypes;
};

export default DismissReferralBannerParams;
