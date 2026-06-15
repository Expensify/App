import React from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LoadingIndicator from '@components/LoadingIndicator';
import {useMultifactorAuthentication, useMultifactorAuthenticationActions, useMultifactorAuthenticationState, usePromptContent} from '@components/MultifactorAuthentication/Context';
import MultifactorAuthenticationPromptContent from '@components/MultifactorAuthentication/PromptContent';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {markHasAcceptedSoftPrompt} from '@libs/actions/MultifactorAuthentication';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultifactorAuthenticationModalNavigatorParamList} from '@libs/Navigation/types';
import variables from '@styles/variables';
import type SCREENS from '@src/SCREENS';

type MultifactorAuthenticationPromptPageProps = PlatformStackScreenProps<MultifactorAuthenticationModalNavigatorParamList, typeof SCREENS.MULTIFACTOR_AUTHENTICATION.PROMPT>;

function MultifactorAuthenticationPromptPage({route}: MultifactorAuthenticationPromptPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {requestCancel} = useMultifactorAuthentication();
    const {dispatch} = useMultifactorAuthenticationActions();
    const {isCancelConfirmVisible} = useMultifactorAuthenticationState();
    const {accountID} = useCurrentUserPersonalDetails();

    const {illustration, title, subtitle, shouldDisplayConfirmButton} = usePromptContent(route.params.promptType);

    const onConfirm = () => {
        markHasAcceptedSoftPrompt(accountID);
        dispatch({type: 'SET_SOFT_PROMPT_APPROVED', payload: true});
    };

    // Escape opens the cancel confirmation; returning false keeps the trap active.
    // focus-trap fires on keydown, but the confirm modal mounts a `keyup` listener via useEffect
    // that catches the matching ESC keyup and instantly closes the modal. Swallow that keyup once.
    const interceptFocusTrapEscape = () => {
        const suppressEscapeKeyup = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopImmediatePropagation();
            }
            document.removeEventListener('keyup', suppressEscapeKeyup, true);
        };
        document.addEventListener('keyup', suppressEscapeKeyup, true);
        requestCancel();
        return false;
    };

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
                    {shouldDisplayConfirmButton ? (
                        <Button
                            success
                            large
                            onPress={onConfirm}
                            text={translate('common.buttonConfirm')}
                        />
                    ) : (
                        <View style={[styles.w100, styles.justifyContentCenter, {height: variables.componentSizeLarge}]}>
                            <LoadingIndicator iconSize={28} />
                        </View>
                    )}
                </FixedFooter>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationPromptPage.displayName = 'MultifactorAuthenticationPromptPage';

export default MultifactorAuthenticationPromptPage;
