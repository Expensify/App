import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import PressableWithDelayToggle from '@components/Pressable/PressableWithDelayToggle';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import {useMemoizedLazyAsset, useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {READ_COMMANDS} from '@libs/API/types';
import Clipboard from '@libs/Clipboard';
import localFileDownload from '@libs/localFileDownload';
import Navigation from '@libs/Navigation/Navigation';
import {toggleTwoFactorAuth} from '@userActions/Session';
import {quitAndNavigateBack, setCodesAreCopied} from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type {TwoFactorAuthPageProps} from './TwoFactorAuthPage';
import TwoFactorAuthWrapper from './TwoFactorAuthWrapper';

function CopyCodesPage({route}: TwoFactorAuthPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Download'] as const);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use correct style
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isExtraSmallScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const [error, setError] = useState('');
    const isFocused = useIsFocused();

    const [account, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});

    const isUserValidated = account?.validated ?? false;
    const {asset: ShieldYellow} = useMemoizedLazyAsset(() => loadIllustration('ShieldYellow' as IllustrationName));

    useEffect(() => {
        if (!isUserValidated) {
            Navigation.navigate(ROUTES.SETTINGS_2FA_VERIFY_ACCOUNT.getRoute());
            return;
        }
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (isLoadingOnyxValue(accountMetadata) || account?.requiresTwoFactorAuth || account?.recoveryCodes || !isUserValidated) {
            return;
        }

        // This screen is rendered underneath other 2FA screens. We don't want it making
        // API calls in the background in response to state updates
        if (!isFocused) {
            return;
        }

        toggleTwoFactorAuth(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- We want to run this when component mounts
    }, [isUserValidated, accountMetadata.status, isFocused]);

    return (
        <TwoFactorAuthWrapper
            title={translate('twoFactorAuth.headerTitle')}
            stepCounter={{
                step: 1,
                text: translate('twoFactorAuth.stepCodes'),
                total: 3,
            }}
            shouldEnableKeyboardAvoidingView={false}
            stepName={CONST.TWO_FACTOR_AUTH_STEPS.COPY_CODES}
            // When the 2FA code step is open from Xero flow, we don't need to pass backTo because we build the necessary root route
            // from the backTo param in the route (in getMatchingRootRouteForRHPRoute) and goBack will not need a fallbackRoute.
            onBackButtonPress={() => quitAndNavigateBack(route?.params?.forwardTo?.includes(READ_COMMANDS.CONNECT_POLICY_TO_XERO) ? undefined : route?.params?.backTo)}
        >
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                {!!isUserValidated && (
                    <Section
                        title={translate('twoFactorAuth.keepCodesSafe')}
                        icon={ShieldYellow}
                        containerStyles={[styles.twoFactorAuthSection]}
                        iconContainerStyles={[styles.ml6]}
                    >
                        <View style={styles.mv3}>
                            <Text>{translate('twoFactorAuth.codesLoseAccess')}</Text>
                        </View>
                        <View style={[styles.twoFactorAuthCodesBox, styles.twoFactorAuthCodesBoxPadding({isExtraSmallScreenWidth, isSmallScreenWidth})]}>
                            {account?.isLoading ? (
                                <View style={styles.twoFactorLoadingContainer}>
                                    <ActivityIndicator />
                                </View>
                            ) : (
                                <>
                                    <View
                                        style={styles.twoFactorAuthCodesContainer}
                                        fsClass={CONST.FULLSTORY.CLASS.MASK}
                                    >
                                        {!!account?.recoveryCodes &&
                                            account?.recoveryCodes?.split(', ').map((code) => (
                                                <Text
                                                    style={styles.twoFactorAuthCode}
                                                    key={code}
                                                >
                                                    {code}
                                                </Text>
                                            ))}
                                    </View>
                                    <View style={styles.twoFactorAuthCodesButtonsContainer}>
                                        <PressableWithDelayToggle
                                            text={translate('twoFactorAuth.copy')}
                                            textChecked={translate('common.copied')}
                                            icon={icons.Copy}
                                            inline={false}
                                            onPress={() => {
                                                Clipboard.setString(account?.recoveryCodes ?? '');
                                                setError('');
                                                setCodesAreCopied();
                                            }}
                                            styles={[styles.button, styles.buttonMedium, styles.twoFactorAuthCodesButton]}
                                            textStyles={[styles.buttonMediumText]}
                                            accessible={false}
                                            tooltipText=""
                                            tooltipTextChecked=""
                                        />
                                        <PressableWithDelayToggle
                                            text={translate('common.download')}
                                            icon={icons.Download}
                                            onPress={() => {
                                                localFileDownload('two-factor-auth-codes', account?.recoveryCodes ?? '', translate);
                                                setError('');
                                                setCodesAreCopied();
                                            }}
                                            inline={false}
                                            styles={[styles.button, styles.buttonMedium, styles.twoFactorAuthCodesButton]}
                                            textStyles={[styles.buttonMediumText]}
                                            accessible={false}
                                            tooltipText=""
                                            tooltipTextChecked=""
                                        />
                                    </View>
                                </>
                            )}
                        </View>
                    </Section>
                )}
                <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                    {!!error && (
                        <FormHelpMessage
                            isError
                            message={error}
                            style={[styles.mb3]}
                        />
                    )}
                    <Button
                        success
                        large
                        isDisabled={!isUserValidated}
                        text={translate('common.next')}
                        onPress={() => {
                            if (!account?.codesAreCopied) {
                                return setError(translate('twoFactorAuth.errorStepCodes'));
                            }
                            Navigation.navigate(ROUTES.SETTINGS_2FA_VERIFY.getRoute(route.params?.backTo, route.params?.forwardTo));
                        }}
                    />
                </FixedFooter>
            </ScrollView>
        </TwoFactorAuthWrapper>
    );
}

export default CopyCodesPage;
