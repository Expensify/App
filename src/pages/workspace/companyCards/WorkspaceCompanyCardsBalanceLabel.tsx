import WorkspaceCardLabel from '@components/WorkspaceCardLabel';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import {format} from 'date-fns';
import React from 'react';

type WorkspaceCompanyCardsBalanceLabelProps = {
    /** Which balance stat this label shows */
    type: typeof CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE | typeof CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT;

    /** Value in cents, or undefined when the bank did not report it */
    value: number | undefined;

    /** Datetime the balance was last fetched, formatted as 'yyyy-MM-dd HH:mm:ss', shown in the tooltip */
    lastUpdated: string | undefined;

    /** Currency the value is denominated in */
    currency: string;
};

function WorkspaceCompanyCardsBalanceLabel({type, value, lastUpdated, currency}: WorkspaceCompanyCardsBalanceLabelProps) {
    const {translate, getLocalDateFromDatetime} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    const displayValue = value === undefined ? translate('workspace.companyCards.balance.notAvailable') : convertToDisplayString(value, currency);
    const formattedLastUpdated = lastUpdated ? format(getLocalDateFromDatetime(lastUpdated), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING) : undefined;
    const description = formattedLastUpdated
        ? translate(`workspace.companyCards.balance.${type}Description`, {lastUpdated: formattedLastUpdated})
        : translate(`workspace.companyCards.balance.${type}DescriptionNoTimestamp`);

    return (
        <WorkspaceCardLabel
            title={translate(`workspace.companyCards.balance.${type}`)}
            description={description}
            displayValue={displayValue}
            shouldFillContainer={false}
        />
    );
}

WorkspaceCompanyCardsBalanceLabel.displayName = 'WorkspaceCompanyCardsBalanceLabel';

export default WorkspaceCompanyCardsBalanceLabel;
