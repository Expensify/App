import LoadingIndicator from '@components/LoadingIndicator';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

const SECURE_ORIGIN = new URL(CONFIG.EXPENSIFY.SECURE_EXPENSIFY_URL).origin;

type CardAuthenticationViewProps = {
    /** Called when the iframe reports the 3DS challenge finished, regardless of outcome — the message carries no success/failure flag. */
    onAuthenticationComplete: () => void;

    /** Called after onAuthenticationComplete to close the surface owning this view. */
    onClose: () => void;
};

function CardAuthenticationView({onAuthenticationComplete, onClose}: CardAuthenticationViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [authenticationLink] = useOnyx(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION);
    const [isLoading, setIsLoading] = useState(true);

    const handleSCAAuthentication = (event: MessageEvent<string>) => {
        if (event.origin !== SECURE_ORIGIN) {
            return;
        }
        if (event.data !== CONST.SCA_AUTHENTICATION_COMPLETE) {
            return;
        }
        onAuthenticationComplete();
        onClose();
    };

    useEffect(() => {
        window.addEventListener('message', handleSCAAuthentication);
        return () => {
            window.removeEventListener('message', handleSCAAuthentication);
        };
    }, [handleSCAAuthentication]);

    return (
        <View style={[styles.flex1]}>
            <iframe
                src={authenticationLink}
                title={translate('subscription.authenticatePaymentCard')}
                height="100%"
                width="100%"
                seamless
                style={{border: 'none'}}
                onLoad={() => setIsLoading(false)}
            />
            {isLoading && <LoadingIndicator />}
        </View>
    );
}

export default CardAuthenticationView;
