import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
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
            <Text>Test</Text>
            <MenuItemWithTopDescription
                description={translate('subscription.details.subscriptionSize')}
                // title='20'
                iconRight={Expensicons.ArrowRight}
                shouldShowRightIcon
            />
        </Section>
    );
}

export default SubscriptionDetails;
