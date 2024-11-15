import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Button from './Button';
import HoldMenuSectionList from './HoldMenuSectionList';
import Lottie from './Lottie';
import DotLottieAnimations from './LottieAnimations';
import Modal from './Modal';
import SafeAreaConsumer from './SafeAreaConsumer';
import Text from './Text';
import TextPill from './TextPill';

const MODAL_PADDING = variables.spacing2;

type ProcessMoneyRequestHoldMenuProps = {
    /** Whether the content is visible */
    isVisible: boolean;

    /** Method to trigger when pressing outside of the popover menu to close it */
    onClose: () => void;

    /** Method to trigger when pressing confirm button */
    onConfirm: () => void;
};

function ProcessMoneyRequestHoldMenu({isVisible, onClose, onConfirm}: ProcessMoneyRequestHoldMenuProps) {
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <Modal
                    isVisible={isVisible}
                    type={onboardingIsMediumOrLargerScreenWidth ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE : CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                    onClose={onClose}
                    innerContainerStyle={{
                        boxShadow: 'none',
                        borderRadius: 16,
                        paddingBottom: 20,
                        paddingTop: onboardingIsMediumOrLargerScreenWidth ? undefined : MODAL_PADDING,
                        ...(onboardingIsMediumOrLargerScreenWidth
                            ? // Override styles defined by MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
                              // To make it take as little space as possible.
                              {
                                  flex: undefined,
                                  width: 'auto',
                              }
                            : {}),
                    }}
                >
                    <View style={[styles.mh100, onboardingIsMediumOrLargerScreenWidth && {width: 400}, safeAreaPaddingBottomStyle]}>
                        <View style={onboardingIsMediumOrLargerScreenWidth ? {padding: MODAL_PADDING} : {paddingHorizontal: MODAL_PADDING}}>
                            <Lottie
                                source={DotLottieAnimations.PreferencesDJ}
                                style={styles.h100}
                                webStyle={styles.h100}
                                autoPlay
                                loop
                            />
                        </View>
                        <View style={[styles.mt5, styles.mh5]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb3]}>
                                <Text style={[styles.textHeadline, styles.mr2]}>{translate('iou.holdEducationalTitle')}</Text>
                                <TextPill textStyles={styles.holdRequestInline}>{translate('violations.hold')}</TextPill>
                            </View>
                            <Text style={[styles.mb3, styles.textSupporting]}>{translate('iou.whatIsHoldExplain')}</Text>
                            <HoldMenuSectionList />
                            <Button
                                success
                                style={[styles.mt3]}
                                text={translate('common.buttonConfirm')}
                                onPress={onConfirm}
                                large
                            />
                        </View>
                    </View>
                </Modal>
            )}
        </SafeAreaConsumer>
    );
}

ProcessMoneyRequestHoldMenu.displayName = 'ProcessMoneyRequestHoldMenu';

export default ProcessMoneyRequestHoldMenu;
