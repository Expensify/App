import React from 'react';
import {ScrollView, View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
import Button from './Button';
import HeaderWithBackButton from './HeaderWithBackButton';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Modal from './Modal';
import Text from './Text';

function ToExpensifyClassicModal() {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const {isSmallScreenWidth, isExtraSmallScreenHeight, windowHeight} = useWindowDimensions();
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
    const theme = useTheme();

    return (
        <Modal
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible
            onClose={() => {}}
            innerContainerStyle={styles.pt0}
            shouldUseCustomBackdrop
        >
            <View style={[styles.flex1]}>
                <View style={[StyleUtils.getBackgroundColorStyle(theme.success), styles.alignItemsCenter, styles.justifyContentCenter, styles.mb5, {height: windowHeight / 3}]}>
                    <HeaderWithBackButton
                        title="Expensify Classic"
                        shouldOverlay
                        shouldShowBackButton
                        onBackButtonPress={() => {}}
                        iconFill={theme.iconColorfulBackground}
                    />
                    <View style={styles.pt10}>
                        <Icon
                            src={Expensicons.OldDotWireframe}
                            width={253.38}
                            height={143.28}
                        />
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.flex1}>
                    <View style={[styles.w100, styles.ph5]}>
                        <Text
                            style={[styles.textHeadline, styles.preWrap, styles.mb2]}
                            numberOfLines={2}
                        >
                            Expensify Classic has everything you&apos;ll need
                        </Text>
                        <Text style={[styles.mb4]}>While we&apos;re busy working on New Expensify, it currently doesn&apos;t support some of the features you&apos;re looking for.</Text>
                        <Text>Don&apos;t worry, Expensify Classic has everything you need</Text>
                    </View>
                </ScrollView>
                <View style={[styles.p5]}>
                    <Button
                        success
                        medium={isExtraSmallScreenHeight}
                        style={[canUseTouchScreen ? styles.mt5 : styles.mt3, styles.w100]}
                        onPress={() => {}}
                        text="Take me to expensify classic"
                    />
                </View>
            </View>
        </Modal>
    );
}

ToExpensifyClassicModal.displayName = 'ToExpensifyClassicModal';

export default ToExpensifyClassicModal;
