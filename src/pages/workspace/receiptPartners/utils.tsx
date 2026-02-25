import React from 'react';
import type {LocaleContextValue} from '@components/LocaleContextProvider';
import Text from '@components/Text';
import type {ThemeStyles} from '@src/styles';

export default function getSynchronizationErrorMessage(receiptPartnerName: string, translate: LocaleContextValue['translate'], styles?: ThemeStyles): React.ReactNode | undefined {
    return (
        <Text style={[styles?.formError]}>
            <Text style={[styles?.formError]}>{translate('workspace.common.authenticationError', receiptPartnerName)}</Text>
        </Text>
    );
}
