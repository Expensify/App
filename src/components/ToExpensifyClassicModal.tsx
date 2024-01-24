import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as Report from '@userActions/Report';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
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
    const navigation = useNavigation();
    const [isModalOpen, setIsModalOpen] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        const navigationState = navigation.getState();
        const routes = navigationState.routes;
        const currentRoute = routes[navigationState.index];
        if (currentRoute && NAVIGATORS.CENTRAL_PANE_NAVIGATOR !== currentRoute.name && currentRoute.name !== SCREENS.HOME) {
            return;
        }

        Welcome.show(routes, () => setIsModalOpen(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const closeModal = useCallback(() => {
        Report.dismissEngagementModal();
        setIsModalOpen(false);
    }, []);

    return (
        <Modal
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isModalOpen}
            onClose={closeModal}
            innerContainerStyle={styles.pt0}
            shouldUseCustomBackdrop
        >
            <View style={[styles.flex1]}>
                <View style={[StyleUtils.getBackgroundColorStyle(theme.success), styles.alignItemsCenter, styles.justifyContentCenter, styles.mb5, {height: windowHeight / 3}]}>
                    <HeaderWithBackButton
                        title="Expensify Classic"
                        shouldOverlay
                        shouldShowBackButton
                        onBackButtonPress={closeModal}
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
                            Expensify Classic has everything you`&apos;`ll need
                        </Text>
                        <Text style={[styles.mb4]}>While we`&apos;`re busy working on New Expensify, it currently doesn`&apos;`t support some of the features you`&apos;`re looking for.</Text>
                        <Text>Don`&apos;`t worry, Expensify Classic has everything you need.</Text>
                    </View>
                </ScrollView>
                <View style={[styles.ph5]}>
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
