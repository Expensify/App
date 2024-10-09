import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import PaymentCardForm from '@components/AddPaymentCard/PaymentCardForm';
import type {FormOnyxValues} from '@components/Form/types';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section, {CARD_LAYOUT} from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as PaymentMethods from '@userActions/PaymentMethods';
import * as PolicyActions from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type WorkspaceOwnerPaymentCardFormProps = {
    /** The policy */
    policy: OnyxEntry<OnyxTypes.Policy>;
};

function WorkspaceOwnerPaymentCardForm({policy}: WorkspaceOwnerPaymentCardFormProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const [shouldShowPaymentCardForm, setShouldShowPaymentCardForm] = useState(false);

    const policyID = policy?.id;

    const checkIfCanBeRendered = useCallback(() => {
        const changeOwnerErrors = Object.keys(policy?.errorFields?.changeOwner ?? {});
        if (changeOwnerErrors.at(0) !== CONST.POLICY.OWNERSHIP_ERRORS.NO_BILLING_CARD) {
            setShouldShowPaymentCardForm(false);
        }

        setShouldShowPaymentCardForm(true);
    }, [policy?.errorFields?.changeOwner]);

    useEffect(
        () => {
            PaymentMethods.clearPaymentCardFormErrorAndSubmit();
            checkIfCanBeRendered();

            return () => {
                PaymentMethods.clearPaymentCardFormErrorAndSubmit();
            };
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [],
    );

    useEffect(() => {
        checkIfCanBeRendered();
    }, [checkIfCanBeRendered]);

    const addPaymentCard = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM>) => {
            const cardData = {
                cardNumber: CardUtils.getMCardNumberString(values.cardNumber),
                cardMonth: CardUtils.getMonthFromExpirationDateString(values.expirationDate),
                cardYear: CardUtils.getYearFromExpirationDateString(values.expirationDate),
                cardCVV: values.securityCode,
                addressName: values.nameOnCard,
                addressZip: values.addressZipCode,
                currency: values.currency,
            };

            PolicyActions.addBillingCardAndRequestPolicyOwnerChange(policyID, cardData);
        },
        [policyID],
    );

    return (
        <PaymentCardForm
            shouldShowPaymentCardForm={shouldShowPaymentCardForm}
            addPaymentCard={addPaymentCard}
            showCurrencyField
            submitButtonText={translate('workspace.changeOwner.addPaymentCardButtonText')}
            headerContent={<Text style={[styles.textHeadline, styles.mt3, styles.mb2, styles.ph5]}>{translate('workspace.changeOwner.addPaymentCardTitle')}</Text>}
            footerContent={
                <>
                    <Text style={[styles.textMicroSupporting, styles.mt5]}>
                        {translate('workspace.changeOwner.addPaymentCardReadAndAcceptTextPart1')}{' '}
                        <TextLink
                            style={[styles.textMicroSupporting, styles.link]}
                            href={CONST.TERMS_URL}
                        >
                            {translate('workspace.changeOwner.addPaymentCardTerms')}
                        </TextLink>{' '}
                        {translate('workspace.changeOwner.addPaymentCardAnd')}{' '}
                        <TextLink
                            style={[styles.textMicroSupporting, styles.link]}
                            href={CONST.PRIVACY_URL}
                        >
                            {translate('workspace.changeOwner.addPaymentCardPrivacy')}
                        </TextLink>{' '}
                        {translate('workspace.changeOwner.addPaymentCardReadAndAcceptTextPart2')}
                    </Text>
                    <Section
                        icon={Illustrations.ShieldYellow}
                        cardLayout={CARD_LAYOUT.ICON_ON_LEFT}
                        title={translate('requestorStep.isMyDataSafe')}
                        containerStyles={[styles.mh0, styles.mt5]}
                    >
                        <View style={[styles.mt4, styles.ph2, styles.pb2]}>
                            <Text style={[styles.searchInputStyle, styles.dFlex, styles.alignItemsCenter]}>
                                <Icon
                                    src={Expensicons.Checkmark}
                                    additionalStyles={[styles.mr3]}
                                    fill={theme.iconSuccessFill}
                                />
                                {translate('workspace.changeOwner.addPaymentCardPciCompliant')}
                            </Text>
                            <Text style={[styles.mt3, styles.searchInputStyle, styles.dFlex, styles.alignItemsCenter]}>
                                <Icon
                                    src={Expensicons.Checkmark}
                                    additionalStyles={[styles.mr3]}
                                    fill={theme.iconSuccessFill}
                                />
                                {translate('workspace.changeOwner.addPaymentCardBankLevelEncrypt')}
                            </Text>
                            <Text style={[styles.mt3, styles.searchInputStyle, styles.dFlex, styles.alignItemsCenter]}>
                                <Icon
                                    src={Expensicons.Checkmark}
                                    additionalStyles={[styles.mr3]}
                                    fill={theme.iconSuccessFill}
                                />
                                {translate('workspace.changeOwner.addPaymentCardRedundant')}
                            </Text>
                        </View>
                        <Text style={[styles.mt3, styles.searchInputStyle]}>
                            {translate('workspace.changeOwner.addPaymentCardLearnMore')}{' '}
                            <TextLink
                                style={[styles.searchInputStyle, styles.link]}
                                href={CONST.PERSONAL_DATA_PROTECTION_INFO_URL}
                            >
                                {translate('workspace.changeOwner.addPaymentCardSecurity')}
                            </TextLink>
                            .
                        </Text>
                    </Section>
                </>
            }
        />
    );
}

WorkspaceOwnerPaymentCardForm.displayName = 'WorkspaceOwnerPaymentCardForm';

export default WorkspaceOwnerPaymentCardForm;
