import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {MULTIFACTOR_AUTHENTICATION_PROMPT_UI} from '@components/MultifactorAuthentication/config';
import {useMultifactorAuthenticationInternal} from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationInternalApiContext';
import MultifactorAuthenticationPromptContent from '@components/MultifactorAuthentication/PromptContent';
import useMFACancelOnEscape from '@components/MultifactorAuthentication/useMFACancelOnEscape';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultifactorAuthenticationModalNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type MultifactorAuthenticationPromptPageProps = PlatformStackScreenProps<MultifactorAuthenticationModalNavigatorParamList, typeof SCREENS.MULTIFACTOR_AUTHENTICATION.PROMPT>;

/**
 * The machine routes here only when the account has not accepted the soft prompt on this device,
 * so the copy is static and the confirm button is always available.
 */
function MultifactorAuthenticationPromptPage({route}: MultifactorAuthenticationPromptPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {requestCancel, approveSoftPrompt, state} = useMultifactorAuthenticationInternal();
    const {isCancelConfirmVisible} = state;

    const {illustration, title, subtitle} = MULTIFACTOR_AUTHENTICATION_PROMPT_UI[route.params.promptType];
    const interceptFocusTrapEscape = useMFACancelOnEscape();

    return (
        <ScreenWrapper
            testID={MultifactorAuthenticationPromptPage.displayName}
            focusTrapSettings={{
                // Turn the trap off while the cancel confirmation modal is up so it can't swallow
                // the modal's clicks, and back on when it closes. See https://github.com/Expensify/App/issues/93193
                active: isCancelConfirmVisible ? false : undefined,
                focusTrapOptions: {
                    escapeDeactivates: interceptFocusTrapEscape,
                },
            }}
        >
            <HeaderWithBackButton
                title={translate('multifactorAuthentication.letsVerifyItsYou')}
                onBackButtonPress={requestCancel}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <MultifactorAuthenticationPromptContent
                    illustration={illustration}
                    title={title}
                    subtitle={subtitle}
                />
                <FixedFooter style={[styles.flexColumn, styles.gap3]}>
                    <Button
                        success
                        large
                        onPress={approveSoftPrompt}
                        text={translate('common.buttonConfirm')}
                        testID={CONST.MULTIFACTOR_AUTHENTICATION.TEST_ID.PROMPT_CONFIRM_BUTTON}
                    />
                </FixedFooter>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationPromptPage.displayName = 'MultifactorAuthenticationPromptPage';

export default MultifactorAuthenticationPromptPage;
