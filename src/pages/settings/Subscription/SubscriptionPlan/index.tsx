import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import Section from '@components/Section';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import ComparePlansModal from './ComparePlansModal';
import SaveWithExpensifyButton from './SaveWithExpensifyButton';
import SubscriptionPlanCard from './SubscriptionPlanCard';

function SubscriptionPlan() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const subscriptionPlan = useSubscriptionPlan();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const illustrations = useMemoizedLazyIllustrations(['HandCard']);

    const renderTitle = () => {
        return (
            <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                <Text style={[styles.textHeadline, styles.cardSectionTitle, styles.textStrong]}>{translate('subscription.yourPlan.title')}</Text>
                <Button
                    small
                    text={translate('subscription.yourPlan.exploreAllPlans')}
                    onPress={() => setIsModalVisible(true)}
                />
            </View>
        );
    };

    return (
        <Section
            renderTitle={renderTitle}
            isCentralPane
        >
            <SubscriptionPlanCard subscriptionPlan={subscriptionPlan} />
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt6]}>
                <Icon
                    src={illustrations.HandCard}
                    width={variables.iconHeader}
                    height={variables.iconHeader}
                    additionalStyles={styles.mr2}
                />
                <View style={[styles.flexColumn, styles.justifyContentCenter, styles.flex1, styles.mr2]}>
                    <Text style={[styles.headerText, styles.mt2]}>{translate('subscription.yourPlan.saveWithExpensifyTitle')}</Text>
                    <Text style={[styles.textLabelSupporting, styles.mb2]}>{translate('subscription.yourPlan.saveWithExpensifyDescription')}</Text>
                </View>
                <SaveWithExpensifyButton />
            </View>
            <ComparePlansModal
                isModalVisible={isModalVisible}
                setIsModalVisible={setIsModalVisible}
            />
        </Section>
    );
}

export default SubscriptionPlan;
