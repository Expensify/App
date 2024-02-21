import React, {useRef} from 'react';
import {ScrollView, View} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import expensifyLogo from '@assets/images/expensify-logo-round-transparent.png';
import ContextMenuItem from '@components/ContextMenuItem';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import QRShareWithDownload from '@components/QRShare/QRShareWithDownload';
import type QRShareWithDownloadHandle from '@components/QRShare/QRShareWithDownload/types';
import ScreenWrapper from '@components/ScreenWrapper';
import Section from '@components/Section';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Clipboard from '@libs/Clipboard';
import Navigation from '@libs/Navigation/Navigation';
import * as Url from '@libs/Url';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import DownloadMenuItem from './download';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';

type Props = WithPolicyProps;

function WorkspaceProfileSharePage({policy}: Props) {
    const themeStyles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const qrCodeRef = useRef<QRShareWithDownloadHandle>(null);
    const {isSmallScreenWidth} = useWindowDimensions();

    const policyName = policy?.name ?? '';
    const id = policy?.id ?? '';
    const urlWithTrailingSlash = Url.addTrailingForwardSlash(environmentURL);

    const url = `${urlWithTrailingSlash}${ROUTES.WORKSPACE_PROFILE.getRoute(id)}`;
    return (
        <ScreenWrapper
            testID={WorkspaceProfileSharePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('common.shareCode')}
                onBackButtonPress={Navigation.goBack}
                icon={Illustrations.QRCode}
            />
            <ScrollView style={[themeStyles.flex1, themeStyles.pt3]}>
                <View style={[themeStyles.flex1, isSmallScreenWidth ? themeStyles.workspaceSectionMobile : themeStyles.workspaceSection]}>
                    <Section
                        title={translate('shareCodePage.title')}
                        isCentralPane
                        childrenStyles={themeStyles.pt5}
                        titleStyles={themeStyles.accountSettingsSectionTitle}
                    >
                        <View style={[isSmallScreenWidth ? themeStyles.workspaceSectionMobile : themeStyles.qrShareSection]}>
                            <QRShareWithDownload
                                ref={qrCodeRef}
                                url={url}
                                title={policyName}
                                logo={(policy?.avatar ? policy.avatar : expensifyLogo) as ImageSourcePropType}
                                logoRatio={CONST.QR.DEFAULT_LOGO_SIZE_RATIO}
                                logoMarginRatio={CONST.QR.DEFAULT_LOGO_MARGIN_RATIO}
                            />
                        </View>

                        <View style={themeStyles.mt1}>
                            <ContextMenuItem
                                isAnonymousAction
                                text={translate('qrCodes.copy')}
                                icon={Expensicons.Copy}
                                successIcon={Expensicons.Checkmark}
                                successText={translate('qrCodes.copied')}
                                onPress={() => Clipboard.setString(url)}
                                shouldLimitWidth={false}
                                wrapperStyle={themeStyles.sectionMenuItemTopDescription}
                            />

                            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                            <DownloadMenuItem download={() => qrCodeRef.current?.download?.()} />
                        </View>
                    </Section>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

WorkspaceProfileSharePage.displayName = 'WorkspaceProfileSharePage';

export default withPolicy(WorkspaceProfileSharePage);
