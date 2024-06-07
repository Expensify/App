import React, {useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import type {OptionsPickerItem} from '@components/OptionsPicker';
import OptionsPicker from '@components/OptionsPicker';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type SubscriptionVariant = ValueOf<typeof CONST.SUBSCRIPTION.TYPE>;

const options: Array<OptionsPickerItem<SubscriptionVariant>> = [
    {
        key: CONST.SUBSCRIPTION.TYPE.ANNUAL,
        title: 'subscription.details.annual',
        icon: Illustrations.SubscriptionAnnual,
    },
    {
        key: CONST.SUBSCRIPTION.TYPE.PAYPERUSE,
        title: 'subscription.details.payPerUse',
        icon: Illustrations.SubscriptionPPU,
    },
];

function SubscriptionDetails() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [preferredTheme] = useOnyx(ONYXKEYS.PREFERRED_THEME);

    const [selectedOption, setSelectedOption] = useState(privateSubscription?.type ?? CONST.SUBSCRIPTION.TYPE.ANNUAL);

    const onOptionSelected = (option: SubscriptionVariant) => {
        if (privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL && option === CONST.SUBSCRIPTION.TYPE.PAYPERUSE) {
            Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_SIZE.getRoute(0));
            return;
        }

        setSelectedOption(option);
    };

    // This section is only shown when the subscription is annual
    // An onPress action is going to be assigned to these buttons in phase 2
    let subscriptionSizeSection: React.JSX.Element | null = null;

    if (privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL) {
        subscriptionSizeSection = privateSubscription?.userCount ? (
            <MenuItemWithTopDescription
                description={translate('subscription.details.subscriptionSize')}
                title={`${privateSubscription?.userCount}`}
                wrapperStyle={styles.sectionMenuItemTopDescription}
                style={styles.mt5}
            />
        ) : (
            <>
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
            </>
        );
    }

    return (
        <Section
            title={translate('subscription.details.title')}
            isCentralPane
            titleStyles={styles.textStrong}
        >
            {!!account?.isApprovedAccountant || !!account?.isApprovedAccountantClient ? (
                <View style={[styles.borderedContentCard, styles.p5, styles.mt5]}>
                    <Icon
                        src={preferredTheme === CONST.THEME.LIGHT ? Illustrations.ExpensifyApprovedLogoLight : Illustrations.ExpensifyApprovedLogo}
                        width={variables.modalTopIconWidth}
                        height={variables.menuIconSize}
                    />
                    <Text style={[styles.textLabelSupporting, styles.mt2]}>{translate('subscription.details.zeroCommitment')}</Text>
                </View>
            ) : (
                <>
                    <OptionsPicker
                        options={options}
                        selectedOption={selectedOption}
                        onOptionSelected={onOptionSelected}
                        style={styles.mt5}
                    />
                    {subscriptionSizeSection}
                </>
            )}
        </Section>
    );
}

SubscriptionDetails.displayName = 'SubscriptionDetails';

export default SubscriptionDetails;
