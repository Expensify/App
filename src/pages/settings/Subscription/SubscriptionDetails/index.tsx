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
import useThemeIllustrations from '@hooks/useThemeIllustrations';
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
    const illustrations = useThemeIllustrations();

    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    const [selectedOption, setSelectedOption] = useState(privateSubscription?.type ?? CONST.SUBSCRIPTION.TYPE.ANNUAL);

    const onOptionSelected = (option: SubscriptionVariant) => {
        setSelectedOption(option);
    };

    const onSubscriptionSizePress = () => {
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_SIZE);
    };

    // This section is only shown when the subscription is annual
    const subscriptionSizeSection: React.JSX.Element | null =
        selectedOption === CONST.SUBSCRIPTION.TYPE.ANNUAL ? (
            <>
                <MenuItemWithTopDescription
                    description={translate('subscription.details.subscriptionSize')}
                    shouldShowRightIcon
                    onPress={onSubscriptionSizePress}
                    wrapperStyle={styles.sectionMenuItemTopDescription}
                    style={styles.mt5}
                    title={`${privateSubscription?.userCount ?? ''}`}
                />
                {!privateSubscription?.userCount && (
                    <Text style={styles.mt2}>
                        <Text style={styles.h4}>{translate('subscription.details.headsUpTitle')}</Text>
                        <Text style={styles.textLabelSupporting}>{translate('subscription.details.headsUpBody')}</Text>
                    </Text>
                )}
            </>
        ) : null;

    return (
        <Section
            title={translate('subscription.details.title')}
            isCentralPane
            titleStyles={styles.textStrong}
        >
            {!!account?.isApprovedAccountant || !!account?.isApprovedAccountantClient ? (
                <View style={[styles.borderedContentCard, styles.p5, styles.mt5]}>
                    <Icon
                        src={illustrations.ExpensifyApprovedLogo}
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
