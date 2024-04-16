import React from 'react';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function SearchPageFooter() {
    const themeStyles = useThemeStyles();

    return (
        <ReferralProgramCTA
            referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND}
            style={themeStyles.flexShrink0}
        />
    );
}

SearchPageFooter.displayName = 'SearchPageFooter';

export default SearchPageFooter;
