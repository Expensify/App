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
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SubscriptionDetails() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    return (
        <Section
            title={translate('subscription.details.title')}
            isCentralPane
            titleStyles={styles.textStrong}
        >
            {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
            {account?.isApprovedAccountant || account?.isApprovedAccountantClient ? (
                <View style={[styles.borderedContentCard, styles.p5, styles.mt5]}>
                    <Icon
                        src={Illustrations.ExpensifyApprovedLogo}
                        width={variables.modalTopIconWidth}
                        height={variables.menuIconSize}
                    />
                    <Text style={[styles.textLabelSupporting, styles.mt2]}>{translate('subscription.details.zeroCommitment')}</Text>
                </View>
            ) : (
                <>
                    {privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.PAYPERUSE ? (
                        <OptionItem
                            title={translate('subscription.details.payPerUse')}
                            icon={Illustrations.SubscriptionPPU}
                            style={styles.mt5}
                            isDisabled
                        />
                    ) : (
                        <OptionItem
                            title={translate('subscription.details.annual')}
                            icon={Illustrations.SubscriptionAnnual}
                            style={styles.mt5}
                            isDisabled
                        />
                    )}
                    {privateSubscription?.userCount ? (
                        <MenuItemWithTopDescription
                            description={translate('subscription.details.subscriptionSize')}
                            title={`${privateSubscription?.userCount}`}
                            wrapperStyle={styles.sectionMenuItemTopDescription}
                            style={styles.mt5}
                        />
                    ) : (
                        <Text style={styles.mt5}>
                            <Text style={styles.h4}>{translate('subscription.details.headsUpTitle')}</Text>
                            <Text style={styles.textLabelSupporting}>{translate('subscription.details.headsUpBody')}</Text>
                        </Text>
                    )}
                </>
            )}
        </Section>
    );
}

export default SubscriptionDetails;
