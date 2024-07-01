import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import Onyx, {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import PreTrialBillingBanner from './BillingBanner/PreTrialBillingBanner';
import CardSectionActions from './CardSectionActions';
import CardSectionDataEmpty from './CardSectionDataEmpty';
import CardSectionUtils from './utils';

function CardSection() {
    const {translate, preferredLocale} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);

    const defaultCard = useMemo(() => Object.values(fundList ?? {}).find((card) => card.accountData?.additionalData?.isBillingCard), [fundList]);

    const cardMonth = useMemo(() => DateUtils.getMonthNames(preferredLocale)[(defaultCard?.accountData?.cardMonth ?? 1) - 1], [defaultCard?.accountData?.cardMonth, preferredLocale]);

    const nextPaymentDate = !isEmptyObject(privateSubscription) ? CardSectionUtils.getNextBillingDate() : undefined;

    const sectionSubtitle = defaultCard && !!nextPaymentDate ? translate('subscription.cardSection.cardNextPayment', {nextPaymentDate}) : translate('subscription.cardSection.subtitle');
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
        <Section
            title={translate('subscription.cardSection.title')}
            subtitle={sectionSubtitle}
            isCentralPane
            titleStyles={styles.textStrong}
            subtitleMuted
            banner={BillingBanner}
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
            <MenuItem
                title="Request early cancellation"
                icon={Expensicons.CalendarSolid}
                iconFill={theme.icon}
                shouldShowRightIcon
                wrapperStyle={styles.sectionMenuItemTopDescription}
            />
            {!!account?.hasPurchases && (
                <MenuItem
                    shouldShowRightIcon
                    icon={Expensicons.History}
                    iconStyles={[]}
                    wrapperStyle={styles.sectionMenuItemTopDescription}
                    style={styles.mt5}
                    title={translate('subscription.cardSection.viewPaymentHistory')}
                    titleStyle={styles.textStrong}
                    onPress={() => Navigation.navigate(ROUTES.SEARCH.getRoute(CONST.SEARCH.TAB.ALL))}
                    hoverAndPressStyle={styles.hoveredComponentBG}
                />
            )}
        </Section>
    );
}

CardSection.displayName = 'CardSection';

export default CardSection;
