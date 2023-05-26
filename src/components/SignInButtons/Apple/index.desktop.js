import React from 'react';
import ButtonBase from '../ButtonBase';
import AppleLogoIcon from '../../../../assets/images/signIn/apple-logo.svg';

const AppleSignIn = () => {
    const handleSignIn = () => {
        // handlesignin
    };
    return <ButtonBase onPress={handleSignIn} icon={<AppleLogoIcon />} />;
};

AppleSignIn.displayName = 'AppleSignIn';

export default AppleSignIn;
