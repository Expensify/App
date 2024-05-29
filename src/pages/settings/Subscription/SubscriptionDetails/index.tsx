import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function SubscriptionDetails() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <Section
            title={translate('subscription.details.title')}
            isCentralPane
            titleStyles={styles.textStrong}
        >
            <MenuItemWithTopDescription
                description={translate('subscription.details.subscriptionSize')}
                shouldShowRightIcon
                wrapperStyle={styles.sectionMenuItemTopDescription}
                style={styles.mt5}
            />
            <Text style={styles.mt2}>
                <Text style={styles.h4}>{translate('subscription.details.headsUpTitle')}</Text>
                <Text style={styles.textLabelSupporting}>{translate('subscription.details.headsUpBody')}</Text>
            </Text>
        </Section>
    );
}

export default SubscriptionDetails;
