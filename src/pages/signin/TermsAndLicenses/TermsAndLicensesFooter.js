import React from 'react';
import {View} from 'react-native';
import styles from '../../../styles/styles';
import LogoWordmark from '../../../../assets/images/expensify-wordmark.svg';
import LocalePicker from '../../../components/LocalePicker';

const TermsAndLicensesFooter = () => (
    <View style={[styles.mt4, styles.alignItemsCenter, styles.mb2, styles.flexRow, styles.justifyContentBetween]}>
        <LogoWordmark height={30} width={80} />
        <LocalePicker size="small" />
    </View>
);

TermsAndLicensesFooter.displayName = 'TermsAndLicensesFooter';

export default TermsAndLicensesFooter;
