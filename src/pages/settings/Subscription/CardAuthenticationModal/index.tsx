import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
// eslint-disable-next-line rulesdir/no-api-in-views
import * as API from '@libs/API';
import { WRITE_COMMANDS } from '@libs/API/types';

type CardAuthenticationModalProps = {
    /** Title shown in the header of the modal */
    headerTitle?: string;
};
function CardAuthenticationModal({headerTitle}: CardAuthenticationModalProps) {
    const styles = useThemeStyles();
    const [authenticationLink] = useOnyx(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION);
    const [privateStripeCustomerID] = useOnyx(ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID);
    const [isLoading, setIsLoading] = useState(true);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    useEffect(() => {
        if (privateStripeCustomerID?.status !== CONST.STRIPE_GBP_AUTH_STATUSES.SUCCEEDED) {
            return;
        }
        PaymentMethods.clearPaymentCard3dsVerification();
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION);
    }, [privateStripeCustomerID]);

    useEffect(() => {
        // eslint-disable-next-line rulesdir/prefer-early-return
        window.addEventListener('message', (ev) => {
            if (ev.data === '3DS-authentication-complete') {
              const parameters = {accountID: session?.accountID};
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, rulesdir/no-api-in-views
              API.write(WRITE_COMMANDS.VERIFY_SETUP_INTENT, parameters)
            }
          }, false);
    }, [session?.accountID]);

    const onModalClose = () => {
        PaymentMethods.clearPaymentCard3dsVerification();
    };

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
            isVisible={!!authenticationLink}
            onClose={onModalClose}
            onModalHide={onModalClose}
        >
            <ScreenWrapper
                style={styles.pb0}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID={CardAuthenticationModal.displayName}
            >
                <HeaderWithBackButton
                    title={headerTitle}
                    shouldShowBorderBottom
                    shouldShowCloseButton
                    onCloseButtonPress={onModalClose}
                    shouldShowBackButton={false}
                />
                {isLoading && <FullScreenLoadingIndicator />}
                <View style={[styles.flex1]}>
                    <iframe
                        src={authenticationLink}
                        title="Statements"
                        height="100%"
                        width="100%"
                        seamless
                        style={{border: 'none'}}
                        onLoad={() => {
                            setIsLoading(false);
                        }}
                    />
                </View>
            </ScreenWrapper>
        </Modal>
    );
}

CardAuthenticationModal.displayName = 'CardAuthenticationModal';

export default CardAuthenticationModal;
