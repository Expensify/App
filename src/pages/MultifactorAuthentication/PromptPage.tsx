import React from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LoadingIndicator from '@components/LoadingIndicator';
import {useMultifactorAuthenticationActions, usePromptContent} from '@components/MultifactorAuthentication/Context';
import {useMultifactorAuthenticationInternal} from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationInternalApiContext';
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
    const {requestCancel} = useMultifactorAuthenticationInternal();
    const {dispatch} = useMultifactorAuthenticationActions();
    const {accountID} = useCurrentUserPersonalDetails();

    const {illustration, title, subtitle, shouldDisplayConfirmButton} = usePromptContent(route.params.promptType);

    const onConfirm = () => {
        markHasAcceptedSoftPrompt(accountID);
        dispatch({type: 'SET_SOFT_PROMPT_APPROVED', payload: true});
    };

    // Outside-clicks and Escape route through the central cancel handler; return
    // false to keep the focus trap intact while the confirm modal opens.
    const interceptFocusTrapEscape = () => {
        requestCancel();
        return false;
    };

    return (
        <ScreenWrapper
            testID={MultifactorAuthenticationPromptPage.displayName}
            focusTrapSettings={{
                focusTrapOptions: {
                    allowOutsideClick: interceptFocusTrapEscape,
                    clickOutsideDeactivates: interceptFocusTrapEscape,
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
