import React from 'react';
import {useSnapshotTransactionField} from '@components/MoneyRequestView/contexts/SnapshotTransactionProvider';
import FieldRow from '@components/MoneyRequestView/FieldRow';
import useLocalize from '@hooks/useLocalize';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getDistanceInMeters, hasRoute as hasRouteTransactionUtils, isDistanceRequest as isDistanceRequestTransactionUtils} from '@libs/TransactionUtils';
import {isInvalidMerchantValue} from '@libs/ValidationUtils';
import type {Transaction} from '@src/types/onyx';

function MerchantOrDistanceRowSnapshot() {
    const {translate} = useLocalize();
    const transaction = useSnapshotTransactionField((tx: Transaction) => tx);
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);

    if (isDistanceRequest) {
        const distance = getDistanceInMeters(transaction, transaction?.comment?.customUnit?.distanceUnit);
        const hasRoute = hasRouteTransactionUtils(transaction, true);
        const distanceToDisplay = DistanceRequestUtils.getDistanceForDisplay(hasRoute, distance, transaction?.comment?.customUnit?.distanceUnit, undefined, translate);
        return (
            <FieldRow
                description={translate('common.distance')}
                title={distanceToDisplay}
                numberOfLinesTitle={2}
                interactive={false}
                shouldShowRightIcon={false}
            />
        );
    }

    const merchant = transaction?.merchant;
    if (!merchant || isInvalidMerchantValue(merchant)) {
        return null;
    }

    return (
        <FieldRow
            description={translate('common.merchant')}
            title={merchant}
            interactive={false}
            shouldShowRightIcon={false}
            numberOfLinesTitle={0}
        />
    );
}

export default MerchantOrDistanceRowSnapshot;
