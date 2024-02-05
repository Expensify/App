import React, {useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import useThemeStyles from '@hooks/useThemeStyles';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DismissedReferralBanners} from '@src/types/onyx/Account';

type SearchPageFooterOnyxProps = {
    dismissedReferralBanners: DismissedReferralBanners;
};
function SearchPageFooter({dismissedReferralBanners}: SearchPageFooterOnyxProps) {
    const [shouldShowReferralCTA, setShouldShowReferralCTA] = useState(!dismissedReferralBanners[CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]);
    const themeStyles = useThemeStyles();

    const closeCallToActionBanner = () => {
        setShouldShowReferralCTA(false);
        User.dismissReferralBanner(CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND);
    };

    return (
        <>
            {shouldShowReferralCTA && (
                <View style={[themeStyles.pb5, themeStyles.flexShrink0]}>
                    <ReferralProgramCTA
                        referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND}
                        onCloseButtonPress={closeCallToActionBanner}
                    />
                </View>
            )}
        </>
    );
}

SearchPageFooter.displayName = 'SearchPageFooter';

export default withOnyx<SearchPageFooterOnyxProps, SearchPageFooterOnyxProps>({
    dismissedReferralBanners: {
        key: ONYXKEYS.ACCOUNT,
        selector: (data) => data?.dismissedReferralBanners ?? {},
    },
})(SearchPageFooter);
