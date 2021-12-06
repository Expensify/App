import React from 'react';
import {View} from 'react-native';
import styles from '../../styles/styles';
import CONST from '../../CONST';
import ExpensifyText from '../../components/ExpensifyText';
import TextLink from '../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import LogoWordmark from '../../../assets/images/expensify-wordmark.svg';
import LocalePicker from '../../components/LocalePicker';

const TermsAndLicenses = props => (
    <>
        <View
            style={[
                styles.dFlex,
                styles.flexRow,
                styles.flexWrap,
                styles.textAlignCenter,
                styles.alignItemsCenter,
            ]}
        >
            <ExpensifyText style={[styles.textAlignCenter, styles.textExtraSmallSupporting]}>
                {props.translate('termsOfUse.phrase1')}
            </ExpensifyText>
            <TextLink
                style={[styles.textExtraSmallSupporting, styles.link]}
                href={CONST.TERMS_URL}
            >
                {' '}
                {props.translate('termsOfUse.phrase2')}
                {' '}
            </TextLink>
            <ExpensifyText style={[styles.textAlignCenter, styles.textExtraSmallSupporting]}>
                {props.translate('termsOfUse.phrase3')}
            </ExpensifyText>
            <TextLink
                style={[styles.textExtraSmallSupporting, styles.link]}
                href={CONST.PRIVACY_URL}
            >
                {' '}
                {props.translate('termsOfUse.phrase4')}
            </TextLink>
            <ExpensifyText style={[styles.textAlignCenter, styles.textExtraSmallSupporting]}>.</ExpensifyText>
            <ExpensifyText style={[styles.textAlignCenter, styles.textExtraSmallSupporting]}>
                {props.translate('termsOfUse.phrase5')}
                {' '}
            </ExpensifyText>
            <ExpensifyText style={[styles.textAlignCenter, styles.textExtraSmallSupporting]}>
                {props.translate('termsOfUse.phrase6')}
            </ExpensifyText>
            <TextLink
                style={[styles.textExtraSmallSupporting, styles.link]}
                href={CONST.LICENSES_URL}
            >
                {' '}
                {props.translate('termsOfUse.phrase7')}
            </TextLink>
            <ExpensifyText style={[styles.textAlignCenter, styles.textExtraSmallSupporting]}>.</ExpensifyText>
        </View>
        <View style={[styles.mt4, styles.alignItemsCenter, styles.mb2, styles.flexRow, styles.justifyContentBetween]}>
            <LogoWordmark height={30} width={80} />
            <LocalePicker size="small" />
        </View>
    </>
);

TermsAndLicenses.propTypes = {...withLocalizePropTypes};
TermsAndLicenses.displayName = 'TermsAndLicenses';

export default withLocalize(TermsAndLicenses);
