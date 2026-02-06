import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearPaymentCard3dsVerification, verifySetupIntent} from '@userActions/PaymentMethods';
import {verifySetupIntentAndRequestPolicyOwnerChange} from '@userActions/Policy/Policy';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type CardAuthenticationModalProps = {
    /** Title shown in the header of the modal */
    headerTitle?: string;

    policyID?: string;
};

const SECURE_ORIGIN = new URL(CONFIG.EXPENSIFY.SECURE_EXPENSIFY_URL).origin;

function CardAuthenticationModal({headerTitle, policyID}: CardAuthenticationModalProps) {
    const styles = useThemeStyles();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to be consistent with BaseModal component
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [authenticationLink] = useOnyx(ONYXKEYS.VERIFY_3DS_SUBSCRIPTION, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    const onModalClose = useCallback(() => {
        setIsVisible(false);
        clearPaymentCard3dsVerification();
    }, []);

    useEffect(() => {
        if (!authenticationLink) {
            return;
        }
        setIsVisible(!!authenticationLink);
    }, [authenticationLink]);

    const handleSCAAuthentication = useCallback(
        (event: MessageEvent<string>) => {
            if (event.origin !== SECURE_ORIGIN) {
                return;
            }
            const message = event.data;
            if (message === CONST.SCA_AUTHENTICATION_COMPLETE) {
                if (policyID) {
                    verifySetupIntentAndRequestPolicyOwnerChange(policyID);
                } else {
                    verifySetupIntent(session?.accountID ?? CONST.DEFAULT_NUMBER_ID, true);
                }
                onModalClose();
            }
        },
        [onModalClose, policyID, session?.accountID],
    );

    useEffect(() => {
        window.addEventListener('message', handleSCAAuthentication);
        return () => {
            window.removeEventListener('message', handleSCAAuthentication);
        };
    }, [handleSCAAuthentication]);

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
            isVisible={isVisible}
            onClose={onModalClose}
        >
            <ScreenWrapper
                style={styles.pb0}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID="CardAuthenticationModal"
            >
                <HeaderWithBackButton
                    title={headerTitle}
                    shouldShowBorderBottom
                    shouldShowCloseButton={!isSmallScreenWidth}
                    onCloseButtonPress={onModalClose}
                    shouldShowBackButton={isSmallScreenWidth}
                    onBackButtonPress={onModalClose}
                    shouldDisplayHelpButton={false}
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

export default CardAuthenticationModal;
