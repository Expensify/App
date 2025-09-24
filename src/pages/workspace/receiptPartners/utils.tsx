import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import Text from '@components/Text';
import CONST from '@src/CONST';
import type {ThemeStyles} from '@src/styles';
import type {ReceiptPartners} from '@src/types/onyx/Policy';
import type {ReceiptPartnersIntegration} from './types';

function getReceiptPartnersIntegrationData(
    receiptPartnerName: string,
    receiptPartners: ReceiptPartners | undefined,
    translate: LocaleContextProps['translate'],
): ReceiptPartnersIntegration | undefined {
    switch (receiptPartnerName) {
        case CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER:
            return {
                title: CONST.POLICY.RECEIPT_PARTNERS.NAME_USER_FRIENDLY[CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER],
                description: translate('workspace.receiptPartners.uber.subtitle', {organizationName: receiptPartners?.uber?.organizationName ?? ''}),
                icon: Expensicons.Uber,
                pendingFields: {},
                errorFields: {},
            };
        default:
            return undefined;
    }
}

function getSynchronizationErrorMessage(receiptPartnerName: string, translate: LocaleContextProps['translate'], styles?: ThemeStyles): React.ReactNode | undefined {
    return (
        <Text style={[styles?.formError]}>
            <Text style={[styles?.formError]}>{translate('workspace.common.authenticationError', {connectionName: receiptPartnerName})}</Text>
        </Text>
    );
}

export {getReceiptPartnersIntegrationData, getSynchronizationErrorMessage};
