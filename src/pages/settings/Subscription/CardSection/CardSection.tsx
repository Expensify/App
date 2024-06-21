import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import Onyx, {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import Text from '@components/Text';
import useIsEligibleForRefund from '@hooks/useIsEligibleForRefund';
import useLocalize from '@hooks/useLocalize';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as User from '@libs/actions/User';
import DateUtils from '@libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import PreTrialBillingBanner from './BillingBanner/PreTrialBillingBanner';
import CardSectionActions from './CardSectionActions';
import CardSectionDataEmpty from './CardSectionDataEmpty';

function CardSection() {
    const [isRequestRefundModalVisible, setIsRequestRefundModalVisible] = useState(false);
    const {translate, preferredLocale} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const plan = useSubscriptionPlan();
    const isEligibleForRefund = useIsEligibleForRefund();

    const defaultCard = useMemo(() => Object.values(fundList ?? {}).find((card) => card.isDefault), [fundList]);

    const cardMonth = useMemo(() => DateUtils.getMonthNames(preferredLocale)[(defaultCard?.accountData?.cardMonth ?? 1) - 1], [defaultCard?.accountData?.cardMonth, preferredLocale]);

    const requestRefund = useCallback(() => {
        User.requestRefund();
        setIsRequestRefundModalVisible(false);
    }, []);

    const BillingBanner = <PreTrialBillingBanner />;

    useEffect(() => {
        Onyx.merge(ONYXKEYS.FUND_LIST, [
            {
                accountData: {
                    cardMonth: 11,

                    cardNumber: '1234',

                    cardYear: 2026,

                    currency: 'USD',

                    addressName: 'John Doe',
                },
                isDefault: true,
            },
        ]);
    }, [fundList]);

    return (
        <>
            <Section
                title={translate('subscription.cardSection.title')}
                subtitle={translate('subscription.cardSection.subtitle')}
                isCentralPane
                titleStyles={styles.textStrong}
                subtitleMuted
                banner={BillingBanner}
            >
                <View style={[styles.mt8, styles.mb3, styles.flexRow]}>
                    {!isEmptyObject(defaultCard?.accountData) && (
                        <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                            <Icon
                                src={Expensicons.CreditCard}
                                additionalStyles={styles.subscriptionAddedCardIcon}
                                fill={theme.text}
                                medium
                            />
                            <View style={styles.flex1}>
                                <Text style={styles.textStrong}>{translate('subscription.cardSection.cardEnding', {cardNumber: defaultCard?.accountData?.cardNumber})}</Text>
                                <Text style={styles.mutedNormalTextLabel}>
                                    {translate('subscription.cardSection.cardInfo', {
                                        name: defaultCard?.accountData?.addressName,
                                        expiration: `${cardMonth} ${defaultCard?.accountData?.cardYear}`,
                                        currency: defaultCard?.accountData?.currency,
                                    })}
                                </Text>
                            </View>
                            <CardSectionActions />
                        </View>
                    )}
                    {isEmptyObject(defaultCard?.accountData) && <CardSectionDataEmpty />}
                </View>
                {!isEmptyObject(defaultCard?.accountData && plan) && (
                    <MenuItem
                        shouldShowRightIcon
                        icon={Expensicons.Bill}
                        iconStyles={[]}
                        wrapperStyle={styles.sectionMenuItemTopDescription}
                        style={styles.mt5}
                        title={translate('subscription.cardSection.requestRefund')}
                        titleStyle={styles.textStrong}
                        onPress={() => setIsRequestRefundModalVisible(true)}
                    />
                )}
            </Section>

            <ConfirmModal
                title={translate('subscription.cardSection.requestRefund')}
                isVisible={isRequestRefundModalVisible}
                onConfirm={requestRefund}
                onCancel={() => {
                    setIsRequestRefundModalVisible(false);
                }}
                prompt={
                    <>
                        <Text style={styles.mb4}>{translate('subscription.cardSection.requestRefundModal.phrase1')}</Text>
                        <Text>{translate('subscription.cardSection.requestRefundModal.phrase2')}</Text>
                    </>
                }
                confirmText={translate('subscription.cardSection.requestRefundModal.confirm')}
                cancelText={translate('common.cancel')}
                danger
            />
        </>
    );
}

CardSection.displayName = 'CardSection';

export default CardSection;
