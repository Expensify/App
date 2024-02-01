import React from 'react';
import {ScrollView, View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function ToExpensifyClassicModal() {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isExtraSmallScreenHeight, windowHeight} = useWindowDimensions();
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
    const theme = useTheme();
    const iconWrapperHeight = windowHeight / variables.oldDotWireframeIconWrapperHeightFactor;

    const navigateBack = () => {
        Navigation.goBack(ROUTES.ONBOARD_MANAGE_EXPENSES);
    };

    const navigateToOldDot = () => {
        Link.openOldDotLink(CONST.OLDDOT_URLS.DISMMISSED_REASON);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ToExpensifyClassicModal.displayName}
        >
            <View style={[styles.flex1]}>
                <View style={[StyleUtils.getBackgroundColorStyle(theme.success), StyleUtils.getHeight(iconWrapperHeight), styles.alignItemsCenter, styles.justifyContentCenter, styles.mb4]}>
                    <HeaderWithBackButton
                        title="Expensify Classic"
                        shouldOverlay
                        shouldShowBackButton
                        onBackButtonPress={navigateBack}
                        iconFill={theme.iconColorfulBackground}
                    />
                    <View style={styles.pt10}>
                        <Icon
                            src={Expensicons.OldDotWireframe}
                            width={variables.oldDotWireframeIconWidth}
                            height={variables.oldDotWireframeIconHeight}
                        />
                    </View>
                </View>

                <ScrollView contentContainerStyle={[styles.flex1, styles.ph5]}>
                    <View>
                        <Text
                            style={[styles.textHeadline, styles.preWrap, styles.mb2]}
                            numberOfLines={2}
                        >
                            {translate('expensifyClassic.title')}
                        </Text>
                        <Text style={[styles.mb4]}>{translate('expensifyClassic.firstDescription')}</Text>
                        <Text>{translate('expensifyClassic.secondDescription')}</Text>
                    </View>
                </ScrollView>
                <View style={[styles.ph5, styles.pv4]}>
                    <Button
                        success
                        medium={isExtraSmallScreenHeight}
                        style={[canUseTouchScreen ? styles.mt5 : styles.mt3, styles.w100]}
                        text={translate('expensifyClassic.buttonText')}
                        onPress={navigateToOldDot}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

ToExpensifyClassicModal.displayName = 'ToExpensifyClassicModal';

export default ToExpensifyClassicModal;
