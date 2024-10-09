import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PaymentMethods from '@userActions/PaymentMethods';
import * as PolicyActions from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type CardAuthenticationModalProps = {
    /** Title shown in the header of the modal */
    headerTitle?: string;

    policyID?: string;
};
function CardAuthenticationModal({headerTitle, policyID}: CardAuthenticationModalProps) {
    const styles = useThemeStyles();
    const [authenticationLink] = useOnyx(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    const onModalClose = useCallback(() => {
        setIsVisible(false);
        PaymentMethods.clearPaymentCard3dsVerification();
    }, []);

    useEffect(() => {
        if (!authenticationLink) {
            return;
        }
        setIsVisible(!!authenticationLink);
    }, [authenticationLink]);

    const handleGBPAuthentication = useCallback(
        (event: MessageEvent<string>) => {
            const message = event.data;
            if (message === CONST.GBP_AUTHENTICATION_COMPLETE) {
                if (policyID) {
                    PolicyActions.verifySetupIntentAndRequestPolicyOwnerChange(policyID);
                } else {
                    PaymentMethods.verifySetupIntent(session?.accountID, true);
                }
                onModalClose();
            }
        },
        [onModalClose, policyID, session?.accountID],
    );

    useEffect(() => {
        window.addEventListener('message', handleGBPAuthentication);
        return () => {
            window.removeEventListener('message', handleGBPAuthentication);
        };
    }, [handleGBPAuthentication]);

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
            isVisible={isVisible}
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
