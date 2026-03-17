import React from 'react';
import {View} from 'react-native';
import CollapsibleSection from '@components/CollapsibleSection';
import Icon from '@components/Icon';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import CONST from '@src/CONST';

function LongTermsForm() {
    const icons = useMemoizedLazyExpensifyIcons(['Printer']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, numberFormat} = useLocalize();

    const termsData = [
        {
            title: translate('termsStep.longTermsForm.openingAccountTitle'),
            rightText: convertToDisplayString(0, 'USD'),
            details: translate('termsStep.longTermsForm.openingAccountDetails'),
        },
        {
            title: translate('termsStep.monthlyFee'),
            rightText: convertToDisplayString(0, 'USD'),
            details: translate('termsStep.longTermsForm.monthlyFeeDetails'),
        },
        {
            title: translate('termsStep.longTermsForm.customerServiceTitle'),
            subTitle: translate('termsStep.longTermsForm.automated'),
            rightText: convertToDisplayString(0, 'USD'),
            details: translate('termsStep.longTermsForm.customerServiceDetails'),
        },
        {
            title: translate('termsStep.longTermsForm.customerServiceTitle'),
            subTitle: translate('termsStep.longTermsForm.liveAgent'),
            rightText: convertToDisplayString(0, 'USD'),
            details: translate('termsStep.longTermsForm.customerServiceDetails'),
        },
        {
            title: translate('termsStep.inactivity'),
            rightText: convertToDisplayString(0, 'USD'),
            details: translate('termsStep.longTermsForm.inactivityDetails'),
        },
        {
            title: translate('termsStep.longTermsForm.sendingFundsTitle'),
            rightText: convertToDisplayString(0, 'USD'),
            details: translate('termsStep.longTermsForm.sendingFundsDetails'),
        },
        {
            title: translate('termsStep.electronicFundsWithdrawal'),
            subTitle: translate('termsStep.standard'),
            rightText: convertToDisplayString(0, 'USD'),
            details: translate('termsStep.longTermsForm.electronicFundsStandardDetails'),
        },
        {
            title: translate('termsStep.electronicFundsWithdrawal'),
            subTitle: translate('termsStep.longTermsForm.instant'),
            rightText: `${numberFormat(1.5)}%`,
            subRightText: translate('termsStep.longTermsForm.electronicFundsInstantFeeMin', convertToDisplayString(25, 'USD')),
            details: translate('termsStep.longTermsForm.electronicFundsInstantDetails', numberFormat(1.5), convertToDisplayString(25, 'USD')),
        },
    ];

    const getLongTermsSections = () =>
        termsData.map((section, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <View key={section.title + index}>
                <View style={[styles.longTermsRow]}>
                    <View style={[styles.flex4]}>
                        <Text>{section.title}</Text>
                        {!!section.subTitle && <Text style={[styles.textMicroSupporting, styles.mt1]}>{section.subTitle}</Text>}
                    </View>
                    <View style={[styles.flex1, styles.termsCenterRight]}>
                        <Text style={[styles.textStrong, styles.textAlignRight]}>{section.rightText}</Text>
                        {!!section.subRightText && <Text style={[styles.textMicroSupporting, styles.mt1, styles.textAlignRight]}>{section.subRightText}</Text>}
                    </View>
                </View>
                <Text style={[styles.textLabelSupporting, styles.mt2]}>{section.details}</Text>
            </View>
        ));

    return (
        <>
            <CollapsibleSection
                title={translate('termsStep.longTermsForm.listOfAllFees')}
                shouldShowSectionBorder
            >
                {getLongTermsSections()}
            </CollapsibleSection>

            <Text style={[styles.mb4, styles.mt6, styles.textMicroSupporting]}>{translate('termsStep.longTermsForm.fdicInsuranceBancorp', convertToDisplayString(25000000, 'USD'))}</Text>
            <Text style={[styles.mb4, styles.textMicroSupporting]}>{translate('termsStep.noOverdraftOrCredit')}</Text>
            <Text style={[styles.mb4, styles.textMicroSupporting]}>{translate('termsStep.longTermsForm.contactExpensifyPayments')}</Text>
            <Text style={[styles.mb6, styles.textMicroSupporting]}>{translate('termsStep.longTermsForm.generalInformation')}</Text>

            <View style={styles.flexRow}>
                <Icon
                    fill={theme.icon}
                    src={icons.Printer}
                />
                <TextLink
                    style={styles.ml1}
                    href={CONST.FEES_URL}
                >
                    {translate('termsStep.longTermsForm.printerFriendlyView')}
                </TextLink>
            </View>
        </>
    );
}

export default LongTermsForm;
