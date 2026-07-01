import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/ButtonComposed';
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
import Navigation from '@libs/Navigation/Navigation';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {toggleTwoFactorAuth} from '@userActions/Session';
import {quitAndNavigateBack, setCodesAreCopied} from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
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
    const accountLoadingReasonAttributes: SkeletonSpanReasonAttributes = {context: 'DynamicTwoFactorAuthPage', isLoading: !!account?.isLoading};

    const recoveryCodes = account?.recoveryCodes;

    useEffect(() => {
        if (!isUserValidated) {
            Navigation.isNavigationReady().then(() => {
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_VERIFY_ACCOUNT.path, backPath), {forceReplace: true});
            });
            return;
        }

        if (isFocused && is2FAEnabled) {
            Navigation.isNavigationReady().then(() => {
                Navigation.navigate(ROUTES.SETTINGS_2FA_ENABLED, {forceReplace: true});
            });
            return;
        }

        if (isLoadingOnyxValue(accountMetadata) || is2FAEnabled || account?.recoveryCodes || !isUserValidated) {
            return;
        }

        if (!isFocused) {
            return;
        }

        toggleTwoFactorAuth(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- We want to run this when component mounts
    }, [isUserValidated, accountMetadata.status, isFocused, is2FAEnabled]);

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
                {!!isUserValidated && (
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
                                    <ActivityIndicator reasonAttributes={accountLoadingReasonAttributes} />
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
                    {!!recoveryCodes && (
                        <Button
                            variant="success"
                            size={CONST.BUTTON_SIZE.LARGE}
                            isDisabled={!isUserValidated}
                            onPress={() => {
                                localFileDownload(TWO_FACTOR_AUTH_RECOVERY_CODES_FILENAME, recoveryCodes, translate, undefined, undefined, false);
                                setError('');
                                setCodesAreCopied();
                                announceStatus(translate('fileDownload.success.title'));
                                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_VERIFY.path, backPath), {forceReplace: true});
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
