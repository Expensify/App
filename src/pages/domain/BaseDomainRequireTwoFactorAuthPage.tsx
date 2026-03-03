import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import TwoFactorAuthForm from '@components/TwoFactorAuthForm';
import type {BaseTwoFactorAuthFormRef} from '@components/TwoFactorAuthForm/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {clearValidateDomainTwoFactorCodeError} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import DomainNotFoundPageWrapper from './DomainNotFoundPageWrapper';

type BaseDomainRequireTwoFactorAuthPageProps = {
    domainAccountID: number;
    onSubmit: (code: string) => void;
    onBackButtonPress: () => void;
    pendingAction?: PendingAction;
};

function BaseDomainRequireTwoFactorAuthPage({domainAccountID, onSubmit, onBackButtonPress, pendingAction}: BaseDomainRequireTwoFactorAuthPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [validateDomainTwoFactorCodeErrors] = useOnyx(ONYXKEYS.VALIDATE_DOMAIN_TWO_FACTOR_CODE);

    const baseTwoFactorAuthRef = useRef<BaseTwoFactorAuthFormRef>(null);
    const isUnmounted = useRef(false);

    useEffect(() => {
        return () => {
            isUnmounted.current = true;
        };
    }, []);

    useEffect(() => {
        return () => {
            if (!isUnmounted.current) {
                return;
            }
            clearValidateDomainTwoFactorCodeError();
        };
    }, []);

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                shouldEnableMaxHeight
                shouldUseCachedViewportHeight
                testID="BaseDomainRequireTwoFactorAuthPage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('twoFactorAuth.disableTwoFactorAuth')}
                    onBackButtonPress={onBackButtonPress}
                    shouldDisplayHelpButton={false}
                />

                <FullPageOfflineBlockingView>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.flexGrow1}
                    >
                        <View style={[styles.mh5, styles.mb4, styles.mt3]}>
                            <TwoFactorAuthForm
                                ref={baseTwoFactorAuthRef}
                                shouldAllowRecoveryCode
                                onSubmit={onSubmit}
                                shouldAutoFocus={false}
                                onInputChange={() => {
                                    if (isEmptyObject(validateDomainTwoFactorCodeErrors?.errors)) {
                                        return;
                                    }
                                    clearValidateDomainTwoFactorCodeError();
                                }}
                                errorMessage={getLatestErrorMessage(validateDomainTwoFactorCodeErrors)}
                            />
                        </View>
                    </ScrollView>
                    <FixedFooter style={[styles.mt2, styles.pt2]}>
                        <Button
                            success
                            large
                            text={translate('common.disable')}
                            isLoading={!!pendingAction}
                            onPress={() => baseTwoFactorAuthRef.current?.validateAndSubmitForm()}
                        />
                    </FixedFooter>
                </FullPageOfflineBlockingView>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default BaseDomainRequireTwoFactorAuthPage;
