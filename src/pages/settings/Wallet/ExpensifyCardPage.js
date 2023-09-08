import React from 'react';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import ROUTES from '../../../ROUTES';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import * as CurrencyUtils from '../../../libs/CurrencyUtils';
import MenuItemWithTopDescription from '../../../components/MenuItemWithTopDescription';
import CardPreview from '../../../components/CardPreview';
import useLocalize from '../../../hooks/useLocalize';

const propTypes = {
    /* Onyx Props */

    spendLimit: PropTypes.number,
};

const defaultProps = {
    spendLimit: 0,
};

function ExpensifyCardPage(props) {
    const {translate} = useLocalize();

    const formattedSpendLimitAmount = CurrencyUtils.convertToDisplayString(props.spendLimit);

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('cardPage.expensifyCard')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
                    />
                    <ScrollView contentContainerStyle={safeAreaPaddingBottomStyle}>
                        <View style={[styles.flex1, styles.mb4, styles.mt4]}>
                            <CardPreview />
                        </View>

                        <MenuItemWithTopDescription
                            description={translate('cardPage.availableSpend')}
                            title={formattedSpendLimitAmount}
                            interactive={false}
                            titleStyle={styles.newKansasLarge}
                        />
                    </ScrollView>
                </>
            )}
        </ScreenWrapper>
    );
}

ExpensifyCardPage.propTypes = propTypes;
ExpensifyCardPage.defaultProps = defaultProps;
ExpensifyCardPage.displayName = 'ExpensifyCardPage';

export default ExpensifyCardPage;
