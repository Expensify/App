import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OptionsPickerItem} from '@components/OptionsPicker';
import OptionsPicker from '@components/OptionsPicker';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import * as Subscription from '@userActions/Subscription';
import type {SubscriptionType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const options: Array<OptionsPickerItem<SubscriptionType>> = [
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

    const onOptionSelected = (option: SubscriptionType) => {
        if (privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL && option === CONST.SUBSCRIPTION.TYPE.PAYPERUSE) {
            Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_SIZE.getRoute(0));
            return;
        }

        Subscription.updateSubscriptionType(option);
    };

    const onSubscriptionSizePress = () => {
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_SIZE.getRoute(1));
    };

    // This section is only shown when the subscription is annual
    const subscriptionSizeSection: React.JSX.Element | null =
        privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL ? (
            <>
                <OfflineWithFeedback
                    pendingAction={privateSubscription?.pendingFields?.userCount}
                    errors={privateSubscription?.errorFields?.userCount}
                    onClose={() => {
                        Subscription.clearUpdateSubscriptionSizeError();
                    }}
                >
                    <MenuItemWithTopDescription
                        description={translate('subscription.details.subscriptionSize')}
                        shouldShowRightIcon
                        onPress={onSubscriptionSizePress}
                        wrapperStyle={styles.sectionMenuItemTopDescription}
                        style={styles.mt5}
                        title={`${privateSubscription?.userCount ?? ''}`}
                    />
                </OfflineWithFeedback>
                {!privateSubscription?.userCount && <Text style={[styles.mt2, styles.textLabelSupporting, styles.textLineHeightNormal]}>{translate('subscription.details.headsUp')}</Text>}
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
                <OfflineWithFeedback pendingAction={privateSubscription?.pendingAction}>
                    <OptionsPicker
                        options={options}
                        selectedOption={privateSubscription?.type ?? CONST.SUBSCRIPTION.TYPE.ANNUAL}
                        onOptionSelected={onOptionSelected}
                        style={styles.mt5}
                    />
                    {subscriptionSizeSection}
                </OfflineWithFeedback>
            )}
        </Section>
    );
}

SubscriptionDetails.displayName = 'SubscriptionDetails';

export default SubscriptionDetails;
