import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LoadingIndicator from '@components/LoadingIndicator';
import {MULTIFACTOR_AUTHENTICATION_PROMPT_UI} from '@components/MultifactorAuthentication/config';
import {useMultifactorAuthentication, useMultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context';
import MultifactorAuthenticationPromptContent from '@components/MultifactorAuthentication/PromptContent';
import MultifactorAuthenticationTriggerCancelConfirmModal from '@components/MultifactorAuthentication/TriggerCancelConfirmModal';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultifactorAuthenticationParamList} from '@libs/Navigation/types';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Account} from '@src/types/onyx';

type MultifactorAuthenticationPromptPageProps = PlatformStackScreenProps<MultifactorAuthenticationParamList, typeof SCREENS.MULTIFACTOR_AUTHENTICATION.PROMPT>;

function getHasBiometricsRegistered(data: OnyxEntry<Account>) {
    return data?.multifactorAuthenticationPublicKeyIDs && data.multifactorAuthenticationPublicKeyIDs.length > 0;
}

function MultifactorAuthenticationPromptPage({route}: MultifactorAuthenticationPromptPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {cancel, executeScenario} = useMultifactorAuthentication();
    const {state, dispatch} = useMultifactorAuthenticationState();
    const [hasBiometricsRegistered = false] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true, selector: getHasBiometricsRegistered});

    const contentData = MULTIFACTOR_AUTHENTICATION_PROMPT_UI[route.params.promptType];

    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);

    const onConfirm = () => {
        dispatch({type: 'SET_SOFT_PROMPT_APPROVED', payload: true});
    };

    const showConfirmModal = () => {
        setConfirmModalVisibility(true);
    };

    const hideConfirmModal = () => {
        setConfirmModalVisibility(false);
    };

    const cancelFlow = () => {
        if (isConfirmModalVisible) {
            hideConfirmModal();
        }
        cancel();
    };

    const focusTrapConfirmModal = () => {
        setConfirmModalVisibility(true);
        return false;
    };

    useEffect(() => {
        const {scenario} = route.params;

        if (scenario) {
            executeScenario(scenario);
        }
    }, [executeScenario, route.params]);

    let title: TranslationPaths = contentData.title;

    if (state.isRegistrationComplete) {
        title = 'multifactorAuthentication.nowLetsAuthenticateYou';
    } else if (hasBiometricsRegistered && !state.softPromptApproved) {
        title = 'multifactorAuthentication.letsAuthenticateYou';
    }

    return (
        <ScreenWrapper
            testID={MultifactorAuthenticationPromptPage.displayName}
            focusTrapSettings={{
                focusTrapOptions: {
                    allowOutsideClick: focusTrapConfirmModal,
                    clickOutsideDeactivates: focusTrapConfirmModal,
                    escapeDeactivates: focusTrapConfirmModal,
                },
            }}
        >
            <HeaderWithBackButton
                title={translate('multifactorAuthentication.letsVerifyItsYou')}
                onBackButtonPress={showConfirmModal}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <MultifactorAuthenticationPromptContent
                    animation={contentData.animation}
                    title={title}
                    subtitle={!state.isRegistrationComplete && !hasBiometricsRegistered ? contentData.subtitle : undefined}
                />
                <FixedFooter style={[styles.flexColumn, styles.gap3]}>
                    {!state.softPromptApproved && !state.isRegistrationComplete && !hasBiometricsRegistered ? (
                        <Button
                            success
                            onPress={onConfirm}
                            text={translate('common.buttonConfirm')}
                        />
                    ) : (
                        <View style={[styles.w100, styles.h10]}>
                            <LoadingIndicator />
                        </View>
                    )}
                </FixedFooter>

                <MultifactorAuthenticationTriggerCancelConfirmModal
                    scenario={state.scenario}
                    isVisible={isConfirmModalVisible}
                    onConfirm={cancelFlow}
                    onCancel={hideConfirmModal}
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationPromptPage.displayName = 'MultifactorAuthenticationPromptPage';

export default MultifactorAuthenticationPromptPage;
