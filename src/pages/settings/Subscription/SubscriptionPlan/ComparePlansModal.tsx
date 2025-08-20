import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import type {AnimationOut} from '@components/Modal/ReanimatedModal/types';
import RenderHTML from '@components/RenderHTML';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import SubscriptionPlanCard from './SubscriptionPlanCard';

type ComparePlansModalProps = {
    /** Whether the modal is visible */
    isModalVisible: boolean;

    /** Updates modal visibility */
    setIsModalVisible: (visible: boolean) => void;
};

function ComparePlansModal({isModalVisible, setIsModalVisible}: ComparePlansModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to be consistent with BaseModal component
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [animationOut, setAnimationOut] = useState<AnimationOut>('slideOutRight');

    useEffect(() => {
        setAnimationOut('slideOutRight');
    }, [isModalVisible]);

    const closeComparisonModalWithFadeOutAnimation = () => {
        setAnimationOut('fadeOut');
        setIsModalVisible(false);
    };

    const onClose = () => setIsModalVisible(false);

    const renderPlans = () => (
        <View style={isSmallScreenWidth ? [styles.ph4, styles.pb8] : [styles.ph8, styles.pb8]}>
            <View style={[styles.renderHTML]}>
                <RenderHTML html={translate('subscription.compareModal.subtitle')} />
            </View>
            <View style={isSmallScreenWidth ? styles.flexColumn : [styles.flexRow, styles.gap3]}>
                <SubscriptionPlanCard
                    subscriptionPlan={CONST.POLICY.TYPE.TEAM}
                    closeComparisonModal={closeComparisonModalWithFadeOutAnimation}
                    isFromComparisonModal
                />
                <SubscriptionPlanCard
                    subscriptionPlan={CONST.POLICY.TYPE.CORPORATE}
                    closeComparisonModal={closeComparisonModalWithFadeOutAnimation}
                    isFromComparisonModal
                />
            </View>
        </View>
    );

    const maxHeight = isSmallScreenWidth ? undefined : windowHeight - 40;

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <Modal
                    isVisible={isModalVisible}
                    type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.CENTERED : CONST.MODAL.MODAL_TYPE.CENTERED_SMALL}
                    onClose={onClose}
                    animationOut={isSmallScreenWidth ? animationOut : undefined}
                    innerContainerStyle={isSmallScreenWidth ? {...safeAreaPaddingBottomStyle, maxHeight} : {...styles.workspaceSection, ...safeAreaPaddingBottomStyle, maxHeight}}
                    shouldUseReanimatedModal
                >
                    <HeaderWithBackButton
                        title={translate('subscription.compareModal.comparePlans')}
                        shouldShowCloseButton={!isSmallScreenWidth}
                        onCloseButtonPress={onClose}
                        shouldShowBackButton={isSmallScreenWidth}
                        onBackButtonPress={onClose}
                        style={isSmallScreenWidth ? styles.pl4 : [styles.pr3, styles.pl8]}
                        shouldDisplayHelpButton={false}
                    />
                    <ScrollView>{renderPlans()}</ScrollView>
                </Modal>
            )}
        </SafeAreaConsumer>
    );
}

export default ComparePlansModal;
