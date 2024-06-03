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
        <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
            <Icon
                src={Expensicons.CreditCardExclamation}
                additionalStyles={styles.subscriptionCardIcon}
                fill={theme.icon}
                large
            />
            <View style={styles.alignSelfCenter}>
                <Text style={[styles.mutedNormalTextLabel, styles.textBold]}>{translate('subscription.cardSection.cardNotFound')}</Text>
            </View>
        </View>
    );
}

CardSectionDataEmpty.displayName = 'CardSectionDataEmpty';

export default CardSectionDataEmpty;
