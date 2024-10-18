import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {View} from 'react-native';
import Computer from '@assets/images/laptop-with-second-screen-sync.svg';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImageSVG from '@components/ImageSVG';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksDesktop from '@libs/actions/connections/QuickbooksDesktop';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import LoadingPage from '@pages/LoadingPage';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type RequireQuickBooksDesktopModalProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL>;

function RequireQuickBooksDesktopModal({route}: RequireQuickBooksDesktopModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID: string = route.params.policyID;
    const [isLoading, setIsLoading] = useState(true);
    const [codatSetupLink, setCodatSetupLink] = useState<string>('');

    const ContentWrapper = codatSetupLink ? ({children}: React.PropsWithChildren) => children : FullPageOfflineBlockingView;

    const fetchSetupLink = useCallback(() => {
        setIsLoading(true);
        // eslint-disable-next-line rulesdir/no-thenable-actions-in-views
        QuickbooksDesktop.getQuickbooksDesktopCodatSetupLink(policyID).then((response) => {
            setCodatSetupLink(String(response?.setupUrl ?? ''));
            setIsLoading(false);
        });
    }, [policyID]);

    useLayoutEffect(() => {
        fetchSetupLink();
        // disabling this rule, as we want this to run only on the first render
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    useNetwork({
        onReconnect: () => {
            if (codatSetupLink) {
                return;
            }
            fetchSetupLink();
        },
    });

    if (isLoading) {
        return <LoadingPage title={translate('workspace.qbd.qbdSetup')} />;
    }

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
                <View style={[styles.flex1, styles.ph5]}>
                    <View style={[styles.alignSelfCenter, styles.computerIllustrationContainer, styles.pv6]}>
                        <ImageSVG src={Computer} />
                    </View>

                    <Text style={[styles.textHeadlineH1, styles.pt5]}>{translate('workspace.qbd.setupPage.title')}</Text>
                    <Text style={[styles.textSupporting, styles.textNormal, styles.pt4]}>{translate('workspace.qbd.setupPage.body')}</Text>
                    <View style={[styles.qbdSetupLinkBox, styles.mt5]}>
                        <CopyTextToClipboard
                            text={codatSetupLink}
                            textStyles={[styles.textSupporting]}
                        />
                    </View>
                    <FixedFooter style={[styles.mtAuto, styles.ph0]}>
                        <Button
                            success
                            text={translate('common.done')}
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_TRIGGER_FIRST_SYNC.getRoute(policyID))}
                            pressOnEnter
                            large
                        />
                    </FixedFooter>
                </View>
            </ContentWrapper>
        </ScreenWrapper>
    );
}

RequireQuickBooksDesktopModal.displayName = 'RequireQuickBooksDesktopModal';

export default RequireQuickBooksDesktopModal;
