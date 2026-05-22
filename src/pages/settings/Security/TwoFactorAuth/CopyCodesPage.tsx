import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import Icon from '@components/Icon';
import PressableWithDelayToggle from '@components/Pressable/PressableWithDelayToggle';
import RenderHTML from '@components/RenderHTML';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {READ_COMMANDS} from '@libs/API/types';
import Clipboard from '@libs/Clipboard';
import getPlatform from '@libs/getPlatform';
import localFileDownload from '@libs/localFileDownload';
import Navigation from '@libs/Navigation/Navigation';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {toggleTwoFactorAuth} from '@userActions/Session';
import {quitAndNavigateBack, setCodesAreCopied} from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type {TwoFactorAuthPageProps} from './TwoFactorAuthPage';
import TwoFactorAuthWrapper from './TwoFactorAuthWrapper';

const TWO_FACTOR_AUTH_RECOVERY_CODES_FILENAME = 'DO-NOT-DELETE_Expensify-2FA-RecoveryCodes.txt';

function CopyCodesPage({route}: TwoFactorAuthPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Lightbulb']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use correct style
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isExtraSmallScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const [error, setError] = useState('');
    const [statusAnnouncement, setStatusAnnouncement] = useState({id: 0, text: ''});
    const isFocused = useIsFocused();

    const isWeb = getPlatform() === CONST.PLATFORM.WEB;

    const announceStatus = (message: string) => {
        if (!isWeb) {
            return;
        }
        setStatusAnnouncement((prev) => ({id: prev.id + 1, text: message}));
    };

    const [account, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT);

    const isUserValidated = account?.validated ?? false;
    const accountLoadingReasonAttributes: SkeletonSpanReasonAttributes = {context: 'CopyCodesPage', isLoading: !!account?.isLoading};

    const recoveryCodes = account?.recoveryCodes;

    useEffect(() => {
        if (!isUserValidated) {
            Navigation.navigate(ROUTES.SETTINGS_2FA_VERIFY_ACCOUNT.getRoute());
            return;
        }

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
                {!!isUserValidated && (
                    <View style={[styles.flexRow, styles.mt2, styles.mh5, styles.alignItemsCenter]}>
                        <Icon
                            src={icons.Lightbulb}
                            fill={theme.icon}
                            additionalStyles={styles.mr2}
                            medium
                        />
                        <Text style={[styles.textLabelSupportingNormal, styles.flex1]}>{translate('twoFactorAuth.screenshotTip')}</Text>
                    </View>
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
                            success
                            large
                            isDisabled={!isUserValidated}
                            text={translate('twoFactorAuth.downloadCodes')}
                            onPress={() => {
                                localFileDownload(TWO_FACTOR_AUTH_RECOVERY_CODES_FILENAME, recoveryCodes, translate, undefined, undefined, false);
                                setError('');
                                setCodesAreCopied();
                                announceStatus(translate('fileDownload.success.title'));
                                Navigation.navigate(ROUTES.SETTINGS_2FA_VERIFY.getRoute(route.params?.backTo, route.params?.forwardTo));
                            }}
                        />
                    )}
                </FixedFooter>
            </ScrollView>
        </TwoFactorAuthWrapper>
    );
}

export default CopyCodesPage;
