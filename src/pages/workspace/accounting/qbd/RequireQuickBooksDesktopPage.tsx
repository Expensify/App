import React from 'react';
import {View} from 'react-native';
import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImageSVG from '@components/ImageSVG';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';

function RequireQuickBooksDesktopModal() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['LaptopWithSecondScreenX']);

    const confirm = () => Navigation.goBack();

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
                onBackButtonPress={() => Navigation.goBack()}
            />
            <View style={[styles.flex1, styles.gap2]}>
                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.justifyContentCenter, styles.ph5]}>
                    <View style={[styles.alignSelfCenter, styles.pendingStateCardIllustration]}>
                        <ImageSVG src={illustrations.LaptopWithSecondScreenX} />
                    </View>

                    <Text style={[styles.textAlignCenter, styles.textHeadlineH1, styles.pt5]}>{translate('workspace.qbd.requiredSetupDevice.title')}</Text>
                    <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal, styles.pt3]}>{translate('workspace.qbd.requiredSetupDevice.body1')}</Text>
                    <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal, styles.pt4]}>{translate('workspace.qbd.requiredSetupDevice.body2')}</Text>
                </ScrollView>
                <FixedFooter addBottomSafeAreaPadding>
                    <Button
                        variant="success"
                        onPress={confirm}
                        size={CONST.BUTTON_SIZE.LARGE}
                    >
                        <Button.KeyboardShortcut
                            pressOnEnter
                            onPress={confirm}
                        />
                        <Button.Text>{translate('common.buttonConfirm')}</Button.Text>
                    </Button>
                </FixedFooter>
            </View>
        </ScreenWrapper>
    );
}

export default RequireQuickBooksDesktopModal;
