import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Computer from '@assets/images/laptop-with-second-screen-sync.svg';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import ImageSVG from '@components/ImageSVG';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {setConnectionError} from '@userActions/connections';
import {getQuickbooksDesktopCodatSetupLink} from '@userActions/connections/QuickbooksDesktop';
import {enablePolicyTaxes} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type RequireQuickBooksDesktopModalProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL>;

function RequireQuickBooksDesktopModal({route}: RequireQuickBooksDesktopModalProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const policyID: string = route.params.policyID;
    const [hasError, setHasError] = useState(false);
    const [codatSetupLink, setCodatSetupLink] = useState<string>('');
    const hasResultOfFetchingSetupLink = !!codatSetupLink || hasError;

    const ContentWrapper = hasResultOfFetchingSetupLink
        ? ({children}: React.PropsWithChildren) => children
        : ({children}: React.PropsWithChildren) => <FullPageOfflineBlockingView addBottomSafeAreaPadding>{children}</FullPageOfflineBlockingView>;

    const fetchSetupLink = useCallback(() => {
        setHasError(false);
        // eslint-disable-next-line rulesdir/no-thenable-actions-in-views
        getQuickbooksDesktopCodatSetupLink(policyID).then((response) => {
            if (!response?.jsonCode) {
                return;
            }

            if (response.jsonCode === CONST.JSON_CODE.SUCCESS) {
                setCodatSetupLink(String(response?.setupUrl ?? ''));
            } else {
                setConnectionError(policyID, CONST.POLICY.CONNECTIONS.NAME.QBD, translate('workspace.qbd.setupPage.setupErrorTitle'));
                setHasError(true);
            }
        });
    }, [policyID, translate]);

    useEffect(() => {
        // Since QBD doesn't support Taxes, we should disable them from the LHN when connecting to QBD
        enablePolicyTaxes(policyID, false);

        fetchSetupLink();
        // disabling this rule, as we want this to run only on the first render
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    useNetwork({
        onReconnect: () => {
            if (hasResultOfFetchingSetupLink) {
                return;
            }
            fetchSetupLink();
        },
    });

    const shouldShowError = hasError;

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID={RequireQuickBooksDesktopModal.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.qbd.qbdSetup')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.dismissModal()}
            />
            <ContentWrapper>
                {shouldShowError && (
                    <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.ph5, styles.mb9]}>
                        <Icon
                            src={Illustrations.BrokenMagnifyingGlass}
                            width={116}
                            height={168}
                        />
                        <Text style={[styles.textHeadlineLineHeightXXL, styles.mt3]}>{translate('workspace.qbd.setupPage.setupErrorTitle')}</Text>
                        <View style={[styles.renderHTML, styles.ph5, styles.mv3]}>
                            <RenderHTML html={translate('workspace.qbd.setupPage.setupErrorBody', {conciergeLink: `${environmentURL}/${ROUTES.CONCIERGE}`})} />
                        </View>
                    </View>
                )}
                {!shouldShowError && (
                    <View style={[styles.flex1, styles.ph5]}>
                        <View style={[styles.alignSelfCenter, styles.computerIllustrationContainer, styles.pv6]}>
                            <ImageSVG src={Computer} />
                        </View>

                        <Text style={[styles.textHeadlineH1, styles.pt5]}>{translate('workspace.qbd.setupPage.title')}</Text>
                        <Text style={[styles.textSupporting, styles.textNormal, styles.pt4]}>{translate('workspace.qbd.setupPage.body')}</Text>
                        <View style={[styles.qbdSetupLinkBox, styles.mt5]}>
                            {!hasResultOfFetchingSetupLink ? (
                                <ActivityIndicator
                                    color={theme.spinner}
                                    size="small"
                                />
                            ) : (
                                <CopyTextToClipboard
                                    text={codatSetupLink}
                                    textStyles={[styles.textSupporting]}
                                />
                            )}
                        </View>
                        <FixedFooter
                            style={[styles.mtAuto, styles.ph0]}
                            addBottomSafeAreaPadding
                        >
                            <Button
                                success
                                text={translate('common.done')}
                                onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_TRIGGER_FIRST_SYNC.getRoute(policyID))}
                                pressOnEnter
                                large
                            />
                        </FixedFooter>
                    </View>
                )}
            </ContentWrapper>
        </ScreenWrapper>
    );
}

RequireQuickBooksDesktopModal.displayName = 'RequireQuickBooksDesktopModal';

export default RequireQuickBooksDesktopModal;
