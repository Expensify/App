import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import BillingBanner from './BillingBanner';
import CardSectionActions from './CardSectionActions';
import CardSectionDataEmpty from './CardSectionDataEmpty';

function CardSection() {
    const {translate, preferredLocale} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);

    const defaultCard = useMemo(() => Object.values(fundList ?? {}).find((card) => card.isDefault), [fundList]);

    const cardMonth = useMemo(() => DateUtils.getMonthNames(preferredLocale)[(defaultCard?.accountData?.cardMonth ?? 1) - 1], [defaultCard?.accountData?.cardMonth, preferredLocale]);

    return (
        <Section
            title={translate('subscription.cardSection.title')}
            subtitle={translate('subscription.cardSection.subtitle')}
            isCentralPane
            titleStyles={styles.textStrong}
            subtitleMuted
            banner={
                <BillingBanner
                    title="Your card couldn’t be charged!"
                    subtitle="Before retrying, please call your bank directly to authorize Expensify charges and remove any holds. Otherwise, try adding a different payment card."
                    isError // to show error icon
                    shouldShowRedDotIndicator // to show red dot indicator
                    isTrialActive
                />
            }
        >
            <View style={[styles.mt8, styles.mb3, styles.flexRow]}>
                {!isEmptyObject(defaultCard?.accountData) && (
                    <>
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
                        </View>
                        <CardSectionActions />
                    </>
                )}
                {isEmptyObject(defaultCard?.accountData) && <CardSectionDataEmpty />}
            </View>
        </Section>
    );
}

CardSection.displayName = 'CardSection';

export default CardSection;
