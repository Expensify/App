import Button from '@components/Button';
import Section from '@components/Section';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import {useState} from 'react';
import {View} from 'react-native';

import ComparePlansModal from './ComparePlansModal';
import SubscriptionPlanCard from './SubscriptionPlanCard';

function SubscriptionPlan() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const subscriptionPlan = useSubscriptionPlan();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const renderTitle = () => {
        return (
            <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                <Text
                    style={[styles.textHeadline, styles.cardSectionTitle, styles.textStrong]}
                    accessibilityRole={CONST.ROLE.HEADER}
                >
                    {translate('subscription.yourPlan.title')}
                </Text>
                <Button
                    size={CONST.BUTTON_SIZE.SMALL}
                    onPress={() => setIsModalVisible(true)}
                    sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.EXPLORE_PLANS}
                >
                    <Button.Text>{translate('subscription.yourPlan.exploreAllPlans')}</Button.Text>
                </Button>
            </View>
        );
    };

    return (
        <Section
            renderTitle={renderTitle}
            isCentralPane
        >
            <SubscriptionPlanCard subscriptionPlan={subscriptionPlan} />
            <ComparePlansModal
                isModalVisible={isModalVisible}
                setIsModalVisible={setIsModalVisible}
            />
        </Section>
    );
}

export default SubscriptionPlan;
