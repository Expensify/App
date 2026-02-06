import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImageSVG from '@components/ImageSVG';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';

function RequireQuickBooksDesktopModal() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['LaptopWithSecondScreenX']);

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="RequireQuickBooksDesktopModal"
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('workspace.qbd.qbdSetup')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.dismissModal()}
            />
            <View style={[styles.flex1]}>
                <View style={[styles.flex1, styles.justifyContentCenter, styles.ph5]}>
                    <View style={[styles.alignSelfCenter, styles.pendingStateCardIllustration]}>
                        <ImageSVG src={illustrations.LaptopWithSecondScreenX} />
                    </View>

                    <Text style={[styles.textAlignCenter, styles.textHeadlineH1, styles.pt5]}>{translate('workspace.qbd.requiredSetupDevice.title')}</Text>
                    <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal, styles.pt3]}>{translate('workspace.qbd.requiredSetupDevice.body1')}</Text>
                    <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal, styles.pt4]}>{translate('workspace.qbd.requiredSetupDevice.body2')}</Text>
                </View>
                <FixedFooter addBottomSafeAreaPadding>
                    <Button
                        success
                        text={translate('common.buttonConfirm')}
                        onPress={() => Navigation.dismissModal()}
                        pressOnEnter
                        large
                    />
                </FixedFooter>
            </View>
        </ScreenWrapper>
    );
}

export default RequireQuickBooksDesktopModal;
