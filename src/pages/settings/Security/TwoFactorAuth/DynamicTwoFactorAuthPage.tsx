import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import PressableWithDelayToggle from '@components/Pressable/PressableWithDelayToggle';
import RenderHTML from '@components/RenderHTML';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import Clipboard from '@libs/Clipboard';
import getPlatform from '@libs/getPlatform';
import localFileDownload from '@libs/localFileDownload';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';

import {toggleTwoFactorAuth} from '@userActions/Session';
import {quitAndNavigateBack, setCodesAreCopied} from '@userActions/TwoFactorAuthActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import TwoFactorAuthWrapper from './TwoFactorAuthWrapper';

const TWO_FACTOR_AUTH_RECOVERY_CODES_FILENAME = 'DO-NOT-DELETE_Expensify-2FA-RecoveryCodes.txt';

function DynamicTwoFactorAuthPage() {
    const icons = useMemoizedLazyExpensifyIcons(['Copy']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use correct style
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isExtraSmallScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const [error, setError] = useState('');
    const [statusAnnouncement, setStatusAnnouncement] = useState({id: 0, text: ''});
    const isFocused = useIsFocused();

    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_ROOT.path);

    const isWeb = getPlatform() === CONST.PLATFORM.WEB;

    const announceStatus = (message: string) => {
        if (!isWeb) {
            return;
        }
        setStatusAnnouncement((prev) => ({id: prev.id + 1, text: message}));
    };

    const [account, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT);

    const isUserValidated = account?.validated ?? false;
    const is2FAEnabled = !!account?.requiresTwoFactorAuth;
    const is2FASetupInProgress = !!account?.twoFactorAuthSetupInProgress;

    const recoveryCodes = account?.recoveryCodes;

    // Once 2FA is enabled this page is only reachable by navigating back into it, so the effect below leaves the flow
    // and the recovery codes stay hidden so they don't flash first. The forced-onboarding post-verify handoff is the
    // exception: it sets requiresTwoFactorAuth before Got it clears the setup progress, so the redirect must stay off.
    const shouldLeaveEnabledSetup = is2FAEnabled && !is2FASetupInProgress;

    // In that handoff the Onyx reset after validation drops the recovery codes, so this page has nothing to show, and
    // leaving the flow would skip the handoff that only the success page runs. Send the user back to the success page.
    const shouldResumeForcedSetupHandoff = is2FAEnabled && is2FASetupInProgress && !recoveryCodes;

    useEffect(() => {
        if (!isUserValidated) {
            Navigation.isNavigationReady().then(() => {
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_VERIFY_ACCOUNT.path, backPath), {forceReplace: true});
            });
            return;
        }

        // Skip redirect to the enabled page while setup is still in progress (e.g. post-verify handoff
        // during forced onboarding, when requiresTwoFactorAuth becomes true before Got it clears progress).
        if (isFocused && shouldLeaveEnabledSetup) {
            Navigation.isNavigationReady().then(() => {
                // Pressing browser Back from the success page on web lands here with 2FA already enabled (the
                // recovery-codes page stays in history because Download codes uses PUSH). Go back out of the flow
                // instead of forwarding to the enabled page, which would loop the user straight back to the success page.
                if (navigationRef.current?.canGoBack()) {
                    Navigation.goBack();
                    return;
                }

                // A direct link or a reload can also mount this page with 2FA enabled and nothing to pop. goBack()
                // would then reset to the app root, so open the enabled page instead.
                Navigation.navigate(ROUTES.SETTINGS_2FA_ENABLED, {forceReplace: true});
            });
            return;
        }

        if (isFocused && shouldResumeForcedSetupHandoff) {
            Navigation.isNavigationReady().then(() => {
                // REPLACE, so the next browser Back leaves the flow instead of bouncing between the two pages.
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_SUCCESS.path, backPath), {forceReplace: true});
            });
            return;
        }

        // toggleTwoFactorAuth(true) is a mutation (ENABLE_TWO_FACTOR_AUTH), not a fetch, so it must never run once 2FA
        // is enabled. The forced-onboarding post-verify handoff has 2FA enabled, setup still in progress and no codes
        // (the Onyx reset after validation drops them), and enabling again there would rotate the recovery codes.
        if (isLoadingOnyxValue(accountMetadata) || is2FAEnabled || account?.recoveryCodes || !isUserValidated) {
            return;
        }

        if (!isFocused) {
            return;
        }

        toggleTwoFactorAuth(true);
        // `recoveryCodes` is a dependency because the right-modal `beforeRemove` listener clears the 2FA data after
        // this effect has already run, which happens when a browser back on a freshly loaded page rebuilds the modal.
        // Without it the page would keep rendering an empty codes box with no way to continue. The `is2FAEnabled`
        // guard above keeps this re-run from enabling 2FA a second time.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- We want to run this when component mounts
    }, [isUserValidated, accountMetadata.status, isFocused, is2FAEnabled, is2FASetupInProgress, recoveryCodes]);

    return (
        <TwoFactorAuthWrapper
            title={translate('twoFactorAuth.headerTitle')}
            stepCounter={{
                step: 1,
                text: translate('twoFactorAuth.stepCodes'),
                total: 2,
            }}
            shouldEnableKeyboardAvoidingView={false}
            stepName={CONST.TWO_FACTOR_AUTH_STEPS.COPY_CODES}
            onBackButtonPress={() => quitAndNavigateBack(backPath)}
        >
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                {!!isUserValidated && !shouldLeaveEnabledSetup && !shouldResumeForcedSetupHandoff && (
                    <Section
                        title={translate('twoFactorAuth.keepCodesSafe')}
                        containerStyles={[styles.twoFactorAuthSection]}
                    >
                        <View style={styles.mv3}>
                            <RenderHTML html={translate('twoFactorAuth.codesLoseAccess')} />
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
                                        {!!recoveryCodes &&
                                            recoveryCodes?.split(', ').map((code) => (
                                                <Text
                                                    style={styles.twoFactorAuthCode}
                                                    key={code}
                                                >
                                                    {code}
                                                </Text>
                                            ))}
                                    </View>
                                    {/* Gated like the Download button below, since without codes this copies an empty string */}
                                    {!!recoveryCodes && (
                                        <PressableWithDelayToggle
                                            text={translate('twoFactorAuth.copyCodes')}
                                            textChecked={translate('common.copied')}
                                            icon={icons.Copy}
                                            inline={false}
                                            onPress={() => {
                                                Clipboard.setString(account?.recoveryCodes ?? '');
                                                setError('');
                                                setCodesAreCopied();
                                                announceStatus(translate('common.copied'));
                                            }}
                                            styles={[styles.button, styles.buttonMedium, styles.twoFactorAuthCodesButton]}
                                            wrapperStyles={[styles.twoFactorAuthCodesButtonWrapper, styles.twoFactorAuthCodesButton]}
                                            textStyles={[styles.buttonMediumText]}
                                            tooltipText=""
                                            tooltipTextChecked=""
                                            accessibilityLabel={`${translate('twoFactorAuth.copy')}, ${translate('twoFactorAuth.stepCodes')}`}
                                            accessibilityLabelChecked={translate('common.copied')}
                                            sentryLabel={CONST.SENTRY_LABEL.TWO_FACTOR_AUTH.COPY_CODES}
                                        />
                                    )}
                                </>
                            )}
                        </View>
                    </Section>
                )}
                <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                    {!!statusAnnouncement.text && (
                        <Text
                            key={statusAnnouncement.id}
                            role={CONST.ROLE.ALERT}
                            accessibilityLiveRegion="assertive"
                            style={styles.hiddenElementOutsideOfWindow}
                        >
                            {statusAnnouncement.text}
                        </Text>
                    )}
                    {!!error && (
                        <FormHelpMessage
                            isError
                            message={error}
                            style={[styles.mb3]}
                        />
                    )}
                    {!!recoveryCodes && !shouldLeaveEnabledSetup && (
                        <Button
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            size={CONST.BUTTON_SIZE.LARGE}
                            isDisabled={!isUserValidated}
                            onPress={() => {
                                localFileDownload(TWO_FACTOR_AUTH_RECOVERY_CODES_FILENAME, recoveryCodes, translate, undefined, undefined, false);
                                setError('');
                                setCodesAreCopied();
                                announceStatus(translate('fileDownload.success.title'));
                                // PUSH on web so browser Back returns to the recovery codes. Native has no browser Back, so REPLACE.
                                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_VERIFY.path, backPath), {forceReplace: !isWeb});
                            }}
                        >
                            <Button.Text>{translate('twoFactorAuth.downloadCodes')}</Button.Text>
                        </Button>
                    )}
                </FixedFooter>
            </ScrollView>
        </TwoFactorAuthWrapper>
    );
}

export default DynamicTwoFactorAuthPage;
