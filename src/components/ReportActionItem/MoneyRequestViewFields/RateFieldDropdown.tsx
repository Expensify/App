import AnchoredSelectionListPopover from '@components/AnchoredSelectionListPopover';
import FormHelpMessage from '@components/FormHelpMessage';
import type {ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {setLastSelectedDistanceRate} from '@libs/actions/IOU/MoneyRequest';
import {updateMoneyRequestDistanceRate} from '@libs/actions/IOU/UpdateMoneyRequest';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getCurrency, getDistanceInMeters, getDistanceRateTaxUpdates, getRateID} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {loginSelector} from '@selectors/PersonalDetails';
import React, {useState} from 'react';

type RateFieldDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** Distance expense the picked rate is written to */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Transaction thread report of the expense */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Policy the distance rates belong to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Whether the expense tracks tax, so a rate change updates its tax too */
    shouldUpdateTax: boolean;
};

/**
 * The distance rate list, anchored to the rate row of a saved distance expense. Mounted only once the row is opened. A
 * pick is checked and saved the same way the full-page rate selector does it, tax included.
 */
function RateFieldDropdown({transaction, transactionThreadReport, policy, shouldUpdateTax, onClose, ...popoverProps}: RateFieldDropdownProps) {
    const styles = useThemeStyles();
    const {translate, toLocaleDigit, localeCompare, dateFnsLocale} = useLocalize();
    const {isOffline} = useNetwork();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const personalPolicy = usePersonalPolicy();
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policy?.id)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(policy?.id)}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReport?.parentReportID)}`);
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`);
    const [iouReportOwnerLogin] = usePersonalDetail(parentReport?.ownerAccountID, loginSelector);
    const [currentTransactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${getNonEmptyStringOnyxID(transaction?.transactionID)}`);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const [errorText, setErrorText] = useState('');

    const currentRateID = getRateID(transaction);
    const transactionCurrency = getCurrency(transaction);
    const rates = DistanceRequestUtils.getMileageRates(policy, false, currentRateID);
    const sortedRates = Object.values(rates).sort((a, b) => DistanceRequestUtils.compareRatesByDisplayName(a, b, localeCompare));
    const selectedRateID = currentRateID || DistanceRequestUtils.getDefaultMileageRate(policy)?.customUnitRateID;

    const options = sortedRates.map((rate) => {
        const isSelected = selectedRateID === rate.customUnitRateID;
        const unit = isSelected ? DistanceRequestUtils.getDistanceUnit(transaction, rate) : rate.unit;
        const rateForDisplay = DistanceRequestUtils.getFormattedRateValue(unit, rate.rate, isSelected ? transactionCurrency : rate.currency, translate, toLocaleDigit, getCurrencySymbol);
        const dateLabel = DistanceRequestUtils.getRateDateLabel(rate, translate, dateFnsLocale);
        return {
            text: DistanceRequestUtils.getRateDisplayName(rate) ?? rateForDisplay,
            alternateText: [rate.name ? rateForDisplay : '', dateLabel].filter(Boolean).join(' • '),
            keyForList: rate.customUnitRateID ?? rateForDisplay,
            value: rate.customUnitRateID,
            isDisabled: !rate.enabled,
            isSelected,
        };
    });

    const selectRate = (customUnitRateID: string) => {
        if (!transaction || customUnitRateID === currentRateID) {
            onClose();
            return;
        }

        // The new rate's unit decides the amount, so the distance is converted to it before the limit check
        const selectedRateUnit = rates[customUnitRateID]?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
        const currentUnit = DistanceRequestUtils.getDistanceUnit(transaction, rates[customUnitRateID]);
        const distanceInUnits = DistanceRequestUtils.convertDistanceUnit(getDistanceInMeters(transaction, currentUnit), selectedRateUnit);
        if (!DistanceRequestUtils.isDistanceAmountWithinLimit(distanceInUnits, rates[customUnitRateID]?.rate ?? 0)) {
            setErrorText(translate('iou.error.distanceAmountTooLargeReduceRate'));
            return;
        }

        const taxUpdates = shouldUpdateTax ? getDistanceRateTaxUpdates(policy, transaction, customUnitRateID, getCurrencyDecimals, currentUnit) : undefined;

        setLastSelectedDistanceRate(policy, customUnitRateID);
        updateMoneyRequestDistanceRate({
            isVendorMatchingBetaEnabled: isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING),
            transaction,
            transactionThreadReport,
            parentReport,
            iouReportOwnerLogin,
            rateID: customUnitRateID,
            policy,
            policyTagList: policyTags,
            policyCategories,
            currentUserAccountIDParam: currentUserPersonalDetails.accountID,
            currentUserEmailParam: currentUserPersonalDetails.login ?? '',
            isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
            updatedTaxAmount: taxUpdates?.taxAmount,
            updatedTaxCode: taxUpdates?.taxCode,
            updatedTaxValue: taxUpdates?.taxValue,
            delegateAccountID,
            isOffline,
            currentTransactionViolations,
            reportPolicyTags,
            isTrackIntentUser,
            personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
            getCurrencyDecimals,
            getCurrencySymbol,
            rules,
        });
        onClose();
    };

    return (
        <AnchoredSelectionListPopover
            {...popoverProps}
            onClose={onClose}
            shouldFitContentHeight
            shouldShowHeader
            // Each rate row carries its value below its name, the two-line height the container sizes rows by
            optionCount={options.length}
            isSearchable={false}
            title={translate('common.rate')}
            backButtonSentryLabel={CONST.SENTRY_LABEL.DISTANCE_RATE_PICKER_MODAL.BACK_BUTTON}
        >
            {!!errorText && (
                <FormHelpMessage
                    style={[styles.mh5, styles.mv2]}
                    message={errorText}
                />
            )}
            <SelectionList
                data={options}
                ListItem={SingleSelectListItem}
                onSelectRow={({value}) => selectRate(value ?? '')}
                initiallyFocusedItemKey={selectedRateID}
                shouldSingleExecuteRowSelect
            />
        </AnchoredSelectionListPopover>
    );
}

export default RateFieldDropdown;
