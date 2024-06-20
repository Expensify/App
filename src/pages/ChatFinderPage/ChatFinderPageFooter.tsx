import React from 'react';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import CONST from '@src/CONST';

function ChatFinderPageFooter() {
    return <ReferralProgramCTA referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND} />;
}

ChatFinderPageFooter.displayName = 'ChatFinderPageFooter';

export default ChatFinderPageFooter;
