import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LoadingIndicator from '@components/LoadingIndicator';
import {MULTIFACTOR_AUTHENTICATION_PROMPT_UI} from '@components/MultifactorAuthentication/config';
import {useMultifactorAuthenticationInternal} from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationInternalApiContext';
import MultifactorAuthenticationPromptContent from '@components/MultifactorAuthentication/PromptContent';
import useMFACancelOnEscape from '@components/MultifactorAuthentication/useMFACancelOnEscape';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultifactorAuthenticationModalNavigatorParamList} from '@libs/Navigation/types';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

type MultifactorAuthenticationPromptPageProps = PlatformStackScreenProps<MultifactorAuthenticationModalNavigatorParamList, typeof SCREENS.MULTIFACTOR_AUTHENTICATION.PROMPT>;

function MultifactorAuthenticationPromptPage({route}: MultifactorAuthenticationPromptPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {requestCancel, approveSoftPrompt, state} = useMultifactorAuthenticationInternal();
    const {isCancelConfirmVisible, isProcessingPrompt, isAuthorizing, softPromptApproved, registrationChallenge} = state;

    const {illustration, title: defaultTitle, subtitle: defaultSubtitle} = MULTIFACTOR_AUTHENTICATION_PROMPT_UI[route.params.promptType];
    const interceptFocusTrapEscape = useMFACancelOnEscape();

    // Authorizing swaps the confirm-prompt copy for a status line, in two cases:
    // - a returning device that skipped the soft prompt entirely (never approved this session) shows
    //   the plain "let's authenticate you",
    // - a device that just finished registering (approved the soft prompt and created a credential)
    //   shows the "now" variant, since it's moving straight from registration into authorization.
    // A device that approved the soft prompt without registering (no challenge) keeps the default
    // copy, since it never left the confirm-prompt content and has no registration step behind it.
    let title: TranslationPaths = defaultTitle;
    let subtitle: TranslationPaths | undefined = defaultSubtitle;
    if (isAuthorizing) {
        if (!softPromptApproved) {
            title = 'multifactorAuthentication.letsAuthenticateYou';
            subtitle = undefined;
        } else if (registrationChallenge) {
            // In the current slice the challenge survives through post-registration authorization.
            // Recovery must clear it before re-registration, so it is not a durable flow-history flag.
            title = 'multifactorAuthentication.nowLetsAuthenticateYou';
            subtitle = undefined;
        }
    }

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
                    {isProcessingPrompt ? (
                        <View style={[styles.w100, styles.justifyContentCenter, {height: variables.componentSizeLarge}]}>
                            <LoadingIndicator iconSize={28} />
                        </View>
                    ) : (
                        <Button
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            size={CONST.BUTTON_SIZE.LARGE}
                            onPress={approveSoftPrompt}
                            testID={CONST.MULTIFACTOR_AUTHENTICATION.TEST_ID.PROMPT_CONFIRM_BUTTON}
                        >
                            <Button.Text>{translate('common.buttonConfirm')}</Button.Text>
                        </Button>
                    )}
                </FixedFooter>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationPromptPage.displayName = 'MultifactorAuthenticationPromptPage';

export default MultifactorAuthenticationPromptPage;
