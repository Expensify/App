import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationDataContext from '@components/MoneyRequestConfirmationList/ConfirmationDataContext';
import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import DistanceRequestController from '@components/MoneyRequestConfirmationList/DistanceRequestController';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useDistanceConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useDistanceConfirmationListData';
import SplitBillController from '@components/MoneyRequestConfirmationList/SplitBillController';
import TaxController from '@components/MoneyRequestConfirmationList/TaxController';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import DistanceManualFooter from '@components/MoneyRequestConfirmationListFooter/variants/DistanceManualFooter';
import DistanceMapFooter from '@components/MoneyRequestConfirmationListFooter/variants/DistanceMapFooter';
import DistanceOdometerFooter from '@components/MoneyRequestConfirmationListFooter/variants/DistanceOdometerFooter';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getCreated, isGPSDistanceRequest as isGPSDistanceRequestUtil, isManualDistanceRequest as isManualDistanceRequestUtil} from '@libs/TransactionUtils';

import React from 'react';
import {View} from 'react-native';

/**
 * Confirms a distance expense, for all three of its shapes: a mapped route, a manually entered distance, and an
 * odometer reading.
 */
function DistanceConfirmationList(props: MoneyRequestConfirmationListProps) {
    const {
        transaction,
        selectedParticipants,
        isEditingSplitBill,
        isOdometerDistanceRequest = false,
        receiptStitchError,
        isParticipantPickerVisible = false,
        onToggleBillable,
        onToggleReimbursable,
        receiptOptions,
    } = props;

    const isManualDistanceRequest = isManualDistanceRequestUtil(transaction);
    const isGPSDistanceRequest = isGPSDistanceRequestUtil(transaction);

    const {data, distanceState} = useDistanceConfirmationListData(props);
    const {mileageRate, unit, currency, distance, hasRoute, isDistanceRequestWithPendingRoute} = distanceState;

    const shouldShowRateAutoUpdatedTooltip =
        !!transaction?.comment?.customUnit?.rateAutoUpdated && !!transaction.created && DistanceRequestUtils.isRateEligibleForDate(mileageRate, transaction.created);

    const footerProps = {
        policy: data.policy,
        policyTags: data.policyTags,
        selectedParticipants,
        distanceData: {
            distance,
            // The distance field reads this to decide whether it has a figure worth showing, so a
            // pending route (or a commuter exclusion still being decided) reads as not having one.
            hasRoute: hasRoute && !isDistanceRequestWithPendingRoute,
            unit,
            distanceRateName: mileageRate.name,
            distanceRateCurrency: currency,
            mileageRate,
            expenseDate: getCreated(transaction),
            customUnitRateID: data.customUnitRateID,
            shouldShowRateAutoUpdatedTooltip,
            customUnit: transaction?.comment?.customUnit,
        },
        amountDisplay: data.amountDisplay,
        requiredFlags: data.requiredFlags,
        visibilityFlags: {...data.visibilityFlags, isParticipantPickerVisible},
        errorState: data.errorState,
        toggleHandlers: {onToggleReimbursable, onToggleBillable},
        receiptOptions,
    };

    const renderFooter = () => {
        if (isManualDistanceRequest) {
            return <DistanceManualFooter {...footerProps} />;
        }
        if (isOdometerDistanceRequest) {
            return (
                <DistanceOdometerFooter
                    {...footerProps}
                    receiptStitchError={receiptStitchError}
                />
            );
        }
        return <DistanceMapFooter {...footerProps} />;
    };

    const listFooterContent = (
        <ConfirmationFieldsProvider
            {...data.confirmationFieldsProviderProps}
            isEditingSplitBill={isEditingSplitBill}
            isDistanceRequest
            isManualDistanceRequest={isManualDistanceRequest}
            isOdometerDistanceRequest={isOdometerDistanceRequest}
            isGPSDistanceRequest={isGPSDistanceRequest}
            onTaxAmountEmptyChange={data.setIsTaxAmountEmpty}
        >
            <View>{renderFooter()}</View>
        </ConfirmationFieldsProvider>
    );

    return (
        <ConfirmationDataContext.Provider value={data}>
            <TaxController distanceState={distanceState} />
            <DistanceRequestController distanceState={distanceState} />
            <SplitBillController />
            <FieldAutoSelector />
            <ConfirmationListLayout
                {...data.layoutProps}
                listFooterContent={listFooterContent}
            />
        </ConfirmationDataContext.Provider>
    );
}

export default DistanceConfirmationList;
