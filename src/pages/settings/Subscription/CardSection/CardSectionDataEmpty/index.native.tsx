import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

function CardSectionDataEmpty() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
            <Icon
                src={Expensicons.CreditCardExclamation}
                additionalStyles={styles.subscriptionCardIcon}
                fill={theme.icon}
                medium
            />
            <Text style={[styles.mutedNormalTextLabel, styles.textStrong]}>{translate('subscription.cardSection.cardNotFound')}</Text>
        </View>
    );
}

CardSectionDataEmpty.displayName = 'CardSectionDataEmpty';

export default CardSectionDataEmpty;
