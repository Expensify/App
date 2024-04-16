import React from 'react';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import CONST from '@src/CONST';

function SearchPageFooter() {
    return <ReferralProgramCTA referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND} />;
}

SearchPageFooter.displayName = 'SearchPageFooter';

export default SearchPageFooter;
