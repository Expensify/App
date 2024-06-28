import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OptionItem from '@components/OptionsPicker/OptionItem';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SubscriptionDetails() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();

    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    // This section is only shown when the subscription is annual
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
            <Text style={[styles.mt5, styles.textLabelSupporting, styles.textLineHeightNormal]}>{translate('subscription.details.headsUp')}</Text>
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
                        src={illustrations.ExpensifyApprovedLogo}
                        width={variables.modalTopIconWidth}
                        height={variables.menuIconSize}
                    />
                    <Text style={[styles.textLabelSupporting, styles.mt2]}>{translate('subscription.details.zeroCommitment')}</Text>
                </View>
            ) : (
                <>
                    {privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.PAYPERUSE ? (
                        <OptionItem
                            title="subscription.details.payPerUse"
                            icon={Illustrations.SubscriptionPPU}
                            style={styles.mt5}
                            isDisabled
                        />
                    ) : (
                        <OptionItem
                            title="subscription.details.annual"
                            icon={Illustrations.SubscriptionAnnual}
                            style={styles.mt5}
                            isDisabled
                        />
                    )}
                    {subscriptionSizeSection}
                </>
            )}
        </Section>
    );
}

SubscriptionDetails.displayName = 'SubscriptionDetails';

export default SubscriptionDetails;
