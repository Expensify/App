import React from 'react';
import {View} from 'react-native';
import Computer from '@assets/images/laptop-with-second-screen-x.svg';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImageSVG from '@components/ImageSVG';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type RequireQuickBooksDesktopModalProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL>;

function RequireQuickBooksDesktopModal({route}: RequireQuickBooksDesktopModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID: string = route.params.policyID;

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
            <View style={[styles.flex1]}>
                <View style={[styles.flex1, styles.justifyContentCenter, styles.ph5]}>
                    <View style={[styles.alignSelfCenter, styles.pendingStateCardIllustration]}>
                        <ImageSVG src={Computer} />
                    </View>

                    <Text style={[styles.textAlignCenter, styles.textHeadlineH1, styles.pt5]}>{translate('workspace.qbd.requiredSetupDevice.title')}</Text>
                    <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal, styles.pt3]}>{translate('workspace.qbd.requiredSetupDevice.body1')}</Text>
                    <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal, styles.pt4]}>{translate('workspace.qbd.requiredSetupDevice.body2')}</Text>
                </View>
                <FixedFooter>
                    <Button
                        success
                        text={translate('common.buttonConfirm')}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING.getRoute(policyID))}
                        pressOnEnter
                        large
                    />
                </FixedFooter>
            </View>
        </ScreenWrapper>
    );
}

RequireQuickBooksDesktopModal.displayName = 'RequireQuickBooksDesktopModal';

export default RequireQuickBooksDesktopModal;
