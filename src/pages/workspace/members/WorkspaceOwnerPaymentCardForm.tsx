import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import PaymentCardForm from '@components/AddPaymentCard/PaymentCardForm';
import type {FormOnyxValues} from '@components/Form/types';
import Icon from '@components/Icon';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import RenderHTML from '@components/RenderHTML';
import Section, {CARD_LAYOUT} from '@components/Section';
import Text from '@components/Text';
import {useMemoizedLazyAsset, useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getMCardNumberString, getMonthFromExpirationDateString, getYearFromExpirationDateString} from '@libs/CardUtils';
import {clearPaymentCardFormErrorAndSubmit} from '@userActions/PaymentMethods';
import {addBillingCardAndRequestPolicyOwnerChange} from '@userActions/Policy/Policy';
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
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark'] as const);
    const {asset: ShieldYellow} = useMemoizedLazyAsset(() => loadIllustration('ShieldYellow' as IllustrationName));
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
            clearPaymentCardFormErrorAndSubmit();
            checkIfCanBeRendered();

            return () => {
                clearPaymentCardFormErrorAndSubmit();
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    useEffect(() => {
        checkIfCanBeRendered();
    }, [checkIfCanBeRendered]);

    const addPaymentCard = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM>) => {
            const cardData = {
                cardNumber: getMCardNumberString(values.cardNumber),
                cardMonth: getMonthFromExpirationDateString(values.expirationDate),
                cardYear: getYearFromExpirationDateString(values.expirationDate),
                cardCVV: values.securityCode,
                addressName: values.nameOnCard,
                addressZip: values.addressZipCode,
                currency: values.currency,
            };
            addBillingCardAndRequestPolicyOwnerChange(policyID, cardData);
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
                    <View style={[styles.renderHTML, styles.mt5]}>
                        <RenderHTML html={translate('workspace.changeOwner.addPaymentCardReadAndAcceptText')} />
                    </View>
                    <Section
                        icon={ShieldYellow}
                        cardLayout={CARD_LAYOUT.ICON_ON_LEFT}
                        title={translate('requestorStep.isMyDataSafe')}
                        containerStyles={[styles.mh0, styles.mt5]}
                    >
                        <View style={[styles.mt4, styles.ph2, styles.pb2]}>
                            <Text style={[styles.textSupportingNormal, styles.dFlex, styles.alignItemsCenter]}>
                                <Icon
                                    src={icons.Checkmark}
                                    additionalStyles={[styles.mr3]}
                                    fill={theme.iconSuccessFill}
                                />
                                {translate('workspace.changeOwner.addPaymentCardPciCompliant')}
                            </Text>
                            <Text style={[styles.mt3, styles.textSupportingNormal, styles.dFlex, styles.alignItemsCenter]}>
                                <Icon
                                    src={icons.Checkmark}
                                    additionalStyles={[styles.mr3]}
                                    fill={theme.iconSuccessFill}
                                />
                                {translate('workspace.changeOwner.addPaymentCardBankLevelEncrypt')}
                            </Text>
                            <Text style={[styles.mt3, styles.textSupportingNormal, styles.dFlex, styles.alignItemsCenter]}>
                                <Icon
                                    src={icons.Checkmark}
                                    additionalStyles={[styles.mr3]}
                                    fill={theme.iconSuccessFill}
                                />
                                {translate('workspace.changeOwner.addPaymentCardRedundant')}
                            </Text>
                        </View>
                        <View style={[styles.renderHTML, styles.mt3]}>
                            <RenderHTML html={translate('workspace.changeOwner.addPaymentCardLearnMore')} />
                        </View>
                    </Section>
                </>
            }
        />
    );
}

export default WorkspaceOwnerPaymentCardForm;
