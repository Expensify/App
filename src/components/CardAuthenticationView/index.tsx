import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

const SECURE_ORIGIN = new URL(CONFIG.EXPENSIFY.SECURE_EXPENSIFY_URL).origin;

type CardAuthenticationViewProps = {
    /** Called when the iframe posts a successful 3DS completion message. */
    onSuccess: () => void;

    /** Called after onSuccess to close the surface owning this view. */
    onClose: () => void;
};

function CardAuthenticationView({onSuccess, onClose}: CardAuthenticationViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [authenticationLink] = useOnyx(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION);
    const [isLoading, setIsLoading] = useState(true);
    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'CardAuthenticationView', isLoading};

    const handleSCAAuthentication = (event: MessageEvent<string>) => {
        if (event.origin !== SECURE_ORIGIN) {
            return;
        }
        if (event.data !== CONST.SCA_AUTHENTICATION_COMPLETE) {
            return;
        }
        onSuccess();
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
            {isLoading && <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />}
            <iframe
                src={authenticationLink}
                title={translate('subscription.authenticatePaymentCard')}
                height="100%"
                width="100%"
                seamless
                style={{border: 'none'}}
                onLoad={() => setIsLoading(false)}
            />
        </View>
    );
}

export default CardAuthenticationView;
