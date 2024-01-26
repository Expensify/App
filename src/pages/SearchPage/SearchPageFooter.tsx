import React, {useState} from 'react';
import {View} from 'react-native';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function SearchPageFooter() {
    const [shouldShowReferralCTA, setShouldShowReferralCTA] = useState(true);
    const themeStyles = useThemeStyles();

    return (
        <>
            {shouldShowReferralCTA && (
                <View style={[themeStyles.pb5, themeStyles.flexShrink0]}>
                    <ReferralProgramCTA
                        referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND}
                        onCloseButtonPress={() => setShouldShowReferralCTA(false)}
                    />
                </View>
            )}
        </>
    );
}

SearchPageFooter.displayName = 'SearchPageFooter';

export default SearchPageFooter;
