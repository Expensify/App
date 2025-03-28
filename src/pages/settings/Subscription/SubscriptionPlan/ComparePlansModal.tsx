import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
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
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to be consistent with BaseModal component
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const renderPlans = () => (
        <View style={[styles.ph8, styles.pb8]}>
            <Text style={[styles.textLabelSupporting, styles.textNormal]}>
                {translate('subscription.compareModal.unlockTheFeatures')}
                <TextLink href={CONST.PRICING}>{translate('subscription.compareModal.viewOurPricing')}</TextLink>
                {translate('subscription.compareModal.forACompleteFeatureBreakdown')}
            </Text>
            <View style={isSmallScreenWidth ? styles.flexColumn : [styles.flexRow, styles.gap3]}>
                <SubscriptionPlanCard
                    subscriptionPlan={CONST.POLICY.TYPE.TEAM}
                    closeComparisonModal={() => setIsModalVisible(false)}
                    isFromComparisonModal
                />
                <SubscriptionPlanCard
                    subscriptionPlan={CONST.POLICY.TYPE.CORPORATE}
                    closeComparisonModal={() => setIsModalVisible(false)}
                    isFromComparisonModal
                />
            </View>
        </View>
    );

    return (
        <Modal
            isVisible={isModalVisible}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.CENTERED : CONST.MODAL.MODAL_TYPE.CENTERED_SMALL}
            onClose={() => setIsModalVisible(false)}
            innerContainerStyle={isSmallScreenWidth ? undefined : styles.workspaceSection}
        >
            <HeaderWithBackButton
                title={translate('subscription.compareModal.comparePlans')}
                shouldShowCloseButton
                onCloseButtonPress={() => setIsModalVisible(false)}
                shouldShowBackButton={false}
                style={[styles.pr3, styles.pl8]}
            />
            {isSmallScreenWidth ? <ScrollView>{renderPlans()}</ScrollView> : renderPlans()}
        </Modal>
    );
}

export default ComparePlansModal;
