import React from 'react';
import {View} from 'react-native';
import styles from '../../styles/styles';
import CONST from '../../CONST';
import Text from '../../components/Text';
import TextLink from '../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import LocalePicker from '../../components/LocalePicker';

const currentYear = new Date().getFullYear();

const TermsAndLicenses = props => (
    <>
        <Text style={[styles.textExtraSmallSupporting, styles.mb4]}>
            {`© ${currentYear} Expensify`}
        </Text>
        <Text style={[styles.textExtraSmallSupporting]}>
            {props.translate('termsOfUse.phrase5')}
            <TextLink style={[styles.textExtraSmallSupporting, styles.link]} href={CONST.LICENSES_URL}>
                {' '}
                {props.translate('termsOfUse.phrase6')}
            </TextLink>
            .
        </Text>
        <View style={[styles.mt4, styles.alignItemsCenter, styles.mb2, styles.flexRow, styles.justifyContentBetween]}>
            <LocalePicker size="small" />
        </View>
    </>
);

TermsAndLicenses.propTypes = {...withLocalizePropTypes};
TermsAndLicenses.displayName = 'TermsAndLicenses';

export default withLocalize(TermsAndLicenses);
