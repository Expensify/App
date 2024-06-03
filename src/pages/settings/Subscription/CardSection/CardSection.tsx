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
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import CardSectionActions from './CardSectionActions';
import CardSectionDataEmpty from './CardSectionDataEmpty';

function CardSection() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);

    const defaultCard = useMemo(() => Object.values(fundList ?? {}).find((card) => card.isDefault), [fundList]);

    return (
        <Section
            title={translate('subscription.cardSection.title')}
            subtitle={translate('subscription.cardSection.subtitle')}
            isCentralPane
            titleStyles={styles.textStrong}
            subtitleMuted
        >
            <View style={styles.mt5}>
                <View style={[styles.flexRow, styles.flex1]}>
                    {!isEmptyObject(defaultCard?.accountData) && (
                        <>
                            <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                                <Icon
                                    src={Expensicons.CreditCard}
                                    additionalStyles={styles.subscriptionCardIcon}
                                    fill={theme.text}
                                    large
                                />
                                <View>
                                    <Text>{translate('subscription.cardSection.cardEnding', {cardNumber: defaultCard?.accountData?.cardNumber})}</Text>
                                    <Text style={styles.mutedNormalTextLabel}>
                                        {translate('subscription.cardSection.cardInfo', {
                                            name: defaultCard?.accountData?.addressName,
                                            expiration: `${defaultCard?.accountData?.cardMonth}/${defaultCard?.accountData?.cardYear}`,
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
            </View>
        </Section>
    );
}

CardSection.displayName = 'CardSection';

export default CardSection;
