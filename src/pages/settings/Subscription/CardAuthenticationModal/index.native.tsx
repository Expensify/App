import React, {useEffect, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import {WebView} from 'react-native-webview';
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

type CardAuthenticationModalProps = {
    /** Title shown in the header of the modal */
    headerTitle?: string;
};
const renderLoading = () => <FullScreenLoadingIndicator />;

function CardAuthenticationModal({headerTitle}: CardAuthenticationModalProps) {
    const styles = useThemeStyles();
    const webViewRef = useRef<WebView>(null);
    const [authenticationLink = ''] = useOnyx(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [privateStripeCustomerID] = useOnyx(ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID);
    const authToken = session?.authToken ?? null;
    useEffect(() => {
        if (privateStripeCustomerID?.status !== CONST.STRIPE_GBP_AUTH_STATUSES.SUCCEEDED) {
            return;
        }
        PaymentMethods.clearPaymentCard3dsVerification();
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION);
    }, [privateStripeCustomerID]);

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
                <WebView
                    ref={webViewRef}
                    source={{
                        uri: authenticationLink,
                        headers: {
                            Cookie: `authToken=${authToken}`,
                        },
                    }}
                    incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
                    startInLoadingState
                    renderLoading={renderLoading}
                />
            </ScreenWrapper>
        </Modal>
    );
}

CardAuthenticationModal.displayName = 'CardAuthenticationModal';

export default CardAuthenticationModal;
