import CardAuthenticationView from '@components/CardAuthenticationView';
import CenteredModalLayoutOverlay from '@components/CenteredModalLayoutOverlay';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';

import {verifySetupIntent} from '@userActions/PaymentMethods';
import {verifySetupIntentAndRequestPolicyOwnerChange} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {View} from 'react-native';

type DynamicCardAuthenticationPageProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.DYNAMIC_CARD_AUTHENTICATION>;

function DynamicCardAuthenticationPage({route}: DynamicCardAuthenticationPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.CARD_AUTHENTICATION.path);
    const {accountID: currentUserAccountID, email: currentUserEmail = ''} = useCurrentUserPersonalDetails();
    const policyID = route.params?.policyID;

    // Runs on every challenge outcome (the iframe message carries no success/failure flag); the verify call is what
    // fetches the real result — success closes the add-card form via setupComplete, failure surfaces its error there.
    const verifyAuthenticationResult = () => {
        if (policyID) {
            verifySetupIntentAndRequestPolicyOwnerChange(policyID, currentUserAccountID, currentUserEmail);
            return;
        }
        verifySetupIntent(currentUserAccountID, true);
    };
    const onClose = () => {
        Navigation.goBack(backPath);
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, onClose, {shouldBubble: false});

    return (
        <>
            <CenteredModalLayoutOverlay onBackdropPress={onClose} />
            {/* box-none makes this full-screen wrapper click-transparent so that presses outside the card fall
                through to the backdrop overlay behind it — that's what closes the challenge when the user clicks
                outside the iframe card. Without it, the wrapper would swallow those clicks and the backdrop's
                onBackdropPress would never fire. */}
            <View
                pointerEvents="box-none"
                style={styles.flex1}
            >
                <View style={styles.getCardAuthenticationModalInnerView(shouldUseNarrowLayout)}>
                    <ScreenWrapper
                        includePaddingTop={shouldUseNarrowLayout}
                        includeSafeAreaPaddingBottom={false}
                        testID="DynamicCardAuthenticationPage"
                    >
                        <HeaderWithBackButton
                            title={translate('subscription.authenticatePaymentCard')}
                            shouldShowBorderBottom
                            onBackButtonPress={onClose}
                            shouldDisplayHelpButton={false}
                        />
                        <CardAuthenticationView
                            onAuthenticationComplete={verifyAuthenticationResult}
                            onClose={onClose}
                        />
                    </ScreenWrapper>
                </View>
            </View>
        </>
    );
}

export default DynamicCardAuthenticationPage;
