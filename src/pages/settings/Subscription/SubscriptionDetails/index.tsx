import React from 'react';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import type {OptionsPickerItem} from '@components/OptionsPicker';
import OptionsPicker from '@components/OptionsPicker';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function SubscriptionDetails() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [selectedOption, setSelectedOption] = React.useState<string>(CONST.SUBSCRIPTION.TYPE.ANNUAL);

    const options: OptionsPickerItem[] = [
        {
            key: CONST.SUBSCRIPTION.TYPE.ANNUAL,
            title: translate('subscription.details.annual'),
            icon: Illustrations.SubscriptionAnnual,
        },
        {
            key: CONST.SUBSCRIPTION.TYPE.PAYPERUSE,
            title: translate('subscription.details.payPerUse'),
            icon: Illustrations.SubscriptionPPU,
        },
    ];

    const onOptionSelected = (option: string) => {
        setSelectedOption(option);
    };

    return (
        <Section
            title={translate('subscription.details.title')}
            isCentralPane
            titleStyles={styles.textStrong}
        >
            <OptionsPicker
                options={options}
                selectedOption={selectedOption}
                onOptionSelected={onOptionSelected}
                style={styles.mt5}
            />
            <MenuItemWithTopDescription
                description={translate('subscription.details.subscriptionSize')}
                shouldShowRightIcon
                wrapperStyle={styles.sectionMenuItemTopDescription}
                style={styles.mt5}
            />
            {/* <Icon src={Illustrations.SubscriptionAnnual} />
            <Icon src={Illustrations.SubscriptionPPU} />
            <Icon src={Illustrations.ExpensifyApprovedLogo} /> */}
            <Text style={styles.mt2}>
                <Text style={styles.h4}>{translate('subscription.details.headsUpTitle')}</Text>
                <Text style={styles.textLabelSupporting}>{translate('subscription.details.headsUpBody')}</Text>
            </Text>
        </Section>
    );
}

export default SubscriptionDetails;
