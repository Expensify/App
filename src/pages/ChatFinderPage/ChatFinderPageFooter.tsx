import React from 'react';
import {View} from 'react-native';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function ChatFinderPageFooter() {
    const themeStyles = useThemeStyles();

    return (
        <View style={[themeStyles.flexShrink0]}>
            <ReferralProgramCTA referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND} />
        </View>
    );
}

ChatFinderPageFooter.displayName = 'ChatFinderPageFooter';

export default ChatFinderPageFooter;
