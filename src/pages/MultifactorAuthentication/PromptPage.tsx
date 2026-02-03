import React, {useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LoadingIndicator from '@components/LoadingIndicator';
import {useMultifactorAuthentication, useMultifactorAuthenticationState, usePromptContent} from '@components/MultifactorAuthentication/Context';
import MultifactorAuthenticationPromptContent from '@components/MultifactorAuthentication/PromptContent';
import MultifactorAuthenticationTriggerCancelConfirmModal from '@components/MultifactorAuthentication/TriggerCancelConfirmModal';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultifactorAuthenticationParamList} from '@libs/Navigation/types';
import Navigation from '@navigation/Navigation';
import type SCREENS from '@src/SCREENS';

type MultifactorAuthenticationPromptPageProps = PlatformStackScreenProps<MultifactorAuthenticationParamList, typeof SCREENS.MULTIFACTOR_AUTHENTICATION.PROMPT>;

function MultifactorAuthenticationPromptPage({route}: MultifactorAuthenticationPromptPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {cancel} = useMultifactorAuthentication();
    const {state, dispatch} = useMultifactorAuthenticationState();
    const {isOffline} = useNetwork();

    const {animation, title, subtitle, shouldDisplayConfirmButton} = usePromptContent(route.params.promptType);

    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);

    const onConfirm = () => {
        dispatch({type: 'SET_SOFT_PROMPT_APPROVED', payload: true});
    };

    const showConfirmModal = () => {
        if (isOffline) {
            Navigation.closeRHPFlow();
        } else {
            setConfirmModalVisibility(true);
        }
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
                    animation={animation}
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
