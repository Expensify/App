import React from 'react';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function ChatFinderPageFooter() {
    const themeStyles = useThemeStyles();

    return (
        <ReferralProgramCTA
            referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND}
            style={themeStyles.flexShrink0}
        />
    );
}

ChatFinderPageFooter.displayName = 'ChatFinderPageFooter';

export default ChatFinderPageFooter;
