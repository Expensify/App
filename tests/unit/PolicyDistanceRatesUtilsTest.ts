import {
    getCurrentFuelBandGovernmentRates,
    getCurrentGovernmentMileageRate,
    getDefaultEuroDistanceRateCountry,
    getDistanceExpenseTypeForPolicy,
    getDistanceRateCountryForCurrency,
    getDistanceRateNameError,
    getDistanceRateValueError,
    getDistanceRateValueErrorMessage,
    getExpectedUnitForCountry,
    getExpectedUnitForCurrency,
    getGovernmentRateCountryForCurrency,
    getGovernmentRateCountryPhraseTranslationKey,
    getGovernmentRateSeries,
    getGovernmentRateNote,
    getNoGovernmentRateNote,
    getUKFuelVATTaxRateCode,
    hasGovernmentRateNote,
    isCurrencySupportedForAutoUpdate,
    isGovernmentRateCountry,
    isGovernmentRateUnmodified,
    isMapOrGPSRequired,
    validateCreateDistanceRateForm,
    validateTaxClaimableValue,
} from '@libs/PolicyDistanceRatesUtils';

import CONST from '@src/CONST';
import type {CurrencyList, GovernmentMileageRate, Policy} from '@src/types/onyx';
import type {GovernmentRateSnapshot, Rate} from '@src/types/onyx/Policy';

import createRandomPolicy from '../utils/collections/policies';
import {translateLocal} from '../utils/TestHelper';

describe('PolicyDistanceRatesUtils', () => {
    describe('validateTaxClaimableValue', () => {
        it('should return an error when taxClaimableValue is equal to tax rate', () => {
            // Given a tax claimable value inserted for a distance rate

            // When the taxClaimableValue is equal to the tax rate
            const validate = validateTaxClaimableValue({taxClaimableValue: '0.70'}, {rate: 70, customUnitRateID: ''}, translateLocal);
            // Then validateTaxClaimableValue will return an error.
            expect(validate.taxClaimableValue).toBeDefined();

            // When the taxClaimableValue is greater than the tax rate
            const validate2 = validateTaxClaimableValue({taxClaimableValue: '0.72'}, {rate: 70, customUnitRateID: ''}, translateLocal);
            // Then validateTaxClaimableValue will return an error.
            expect(validate2.taxClaimableValue).toBeDefined();

            // When the taxClaimableValue is less than the tax rate
            const validate3 = validateTaxClaimableValue({taxClaimableValue: '0.65'}, {rate: 70, customUnitRateID: ''}, translateLocal);
            // Then validateTaxClaimableValue will not return an error.
            expect(validate3.taxClaimableValue).toBeUndefined();
        });
    });

    describe('isGovernmentRateUnmodified', () => {
        const baseGovernmentRate = {
            sourceRateID: 'US_2026-01-01',
            rate: 72.5,
            startDate: '2026-01-01',
            endDate: '2026-12-31',
        };

        function buildRate(overrides: Partial<Rate> = {}, governmentRate: GovernmentRateSnapshot = baseGovernmentRate): Rate {
            return {
                customUnitRateID: 'rate1',
                rate: 72.5,
                startDate: '2026-01-01',
                endDate: '2026-12-31',
                attributes: {governmentRate},
                ...overrides,
            };
        }

        it('should return false when the rate has no government rate snapshot', () => {
            expect(isGovernmentRateUnmodified({customUnitRateID: 'rate1', rate: 72.5})).toBe(false);
            expect(isGovernmentRateUnmodified({customUnitRateID: 'rate1', rate: 72.5, attributes: {}})).toBe(false);
        });

        it('should return true when the rate amount, start date, and end date all match the snapshot', () => {
            expect(isGovernmentRateUnmodified(buildRate())).toBe(true);
        });

        it('should return false when the rate amount does not match the snapshot', () => {
            expect(isGovernmentRateUnmodified(buildRate({rate: 70}))).toBe(false);
        });

        it('should return false when the start date does not match the snapshot', () => {
            expect(isGovernmentRateUnmodified(buildRate({startDate: '2026-02-01'}))).toBe(false);
        });

        it('should return false when the end date does not match the snapshot', () => {
            expect(isGovernmentRateUnmodified(buildRate({endDate: '2026-11-30'}))).toBe(false);
        });

        it('should return true when the end date is omitted on both the rate and the snapshot', () => {
            const governmentRate = {sourceRateID: 'GB_2011-04-06', rate: 45, startDate: '2011-04-06'};
            expect(isGovernmentRateUnmodified(buildRate({rate: 45, startDate: '2011-04-06', endDate: undefined}, governmentRate))).toBe(true);
            expect(isGovernmentRateUnmodified(buildRate({rate: 45, startDate: '2011-04-06', endDate: null}, governmentRate))).toBe(true);
        });

        it('should return false when the end date is omitted on only one side', () => {
            // Snapshot has no end date but the rate does
            const openEndedGovernmentRate = {sourceRateID: 'GB_2011-04-06', rate: 45, startDate: '2011-04-06'};
            expect(isGovernmentRateUnmodified(buildRate({rate: 45, startDate: '2011-04-06', endDate: '2026-12-31'}, openEndedGovernmentRate))).toBe(false);

            // Snapshot has an end date but the rate does not
            expect(isGovernmentRateUnmodified(buildRate({endDate: null}))).toBe(false);
            expect(isGovernmentRateUnmodified(buildRate({endDate: undefined}))).toBe(false);
        });

        it('should return true when edited values are restored to match the snapshot', () => {
            const editedRate = buildRate({rate: 99});
            expect(isGovernmentRateUnmodified(editedRate)).toBe(false);
            expect(isGovernmentRateUnmodified({...editedRate, rate: baseGovernmentRate.rate})).toBe(true);
        });

        it('should return true when the restored amount differs only by floating-point noise from the cents conversion', () => {
            // Restoring 0.29 through the submit path stores `Number('0.29') * 100`, which yields 28.999999999999996 rather than 29.
            const governmentRate = {sourceRateID: 'US_2026-01-01', rate: 29, startDate: '2026-01-01', endDate: '2026-12-31'};
            expect(isGovernmentRateUnmodified(buildRate({rate: Number('0.29') * 100}, governmentRate))).toBe(true);
        });

        it('should return true when a kilometer-based government snapshot matches a mile-based stored rate', () => {
            const governmentRate = {sourceRateID: 'CA_2026-01-01', rate: 73, startDate: '2026-01-01', endDate: '2026-12-31'};
            expect(isGovernmentRateUnmodified(buildRate({rate: 117.48}, governmentRate), CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES)).toBe(true);
        });

        it('should return true when a mile-based government snapshot matches a kilometer-based stored rate', () => {
            const governmentRate = {sourceRateID: 'US_2026-01-01', rate: 76, startDate: '2026-01-01', endDate: '2026-12-31'};
            expect(isGovernmentRateUnmodified(buildRate({rate: 47.22}, governmentRate), CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS)).toBe(true);
        });

        it('should return false when a converted government rate has been edited', () => {
            const governmentRate = {sourceRateID: 'CA_2026-01-01', rate: 73, startDate: '2026-01-01', endDate: '2026-12-31'};
            expect(isGovernmentRateUnmodified(buildRate({rate: 117.49}, governmentRate), CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES)).toBe(false);
        });

        it('should fall back to the same-unit comparison when the source country is unknown', () => {
            const governmentRate = {sourceRateID: 'NZ_2026-01-01', rate: 73, startDate: '2026-01-01', endDate: '2026-12-31'};
            expect(isGovernmentRateUnmodified(buildRate({rate: 73}, governmentRate), CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES)).toBe(true);
            expect(isGovernmentRateUnmodified(buildRate({rate: 117.48}, governmentRate), CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES)).toBe(false);
        });

        it('should return false when the snapshot is malformed and has no rate amount', () => {
            // A snapshot missing its rate amount alongside an unset rate must not be reported as unmodified.
            expect(isGovernmentRateUnmodified(buildRate({rate: undefined}, {sourceRateID: 'US_2026-01-01', startDate: '2026-01-01', endDate: '2026-12-31'}))).toBe(false);
        });

        describe('tax reclaimable amount', () => {
            // A 14p fuel band where a sixth of the rate is reclaimable, which the edit page shows as 0.0233
            const fuelBandGovernmentRate = {sourceRateID: 'GB_PETROL_UP_TO_1400_2026-06-01', rate: 14, startDate: '2026-06-01', taxClaimablePercentage: 1 / 6};
            const buildFuelBandRate = (taxClaimablePercentage?: number) =>
                buildRate({rate: 14, startDate: '2026-06-01', endDate: undefined, attributes: {taxClaimablePercentage, governmentRate: fuelBandGovernmentRate}}, fuelBandGovernmentRate);

            // The edit page saves the entered amount as a fraction of the rate
            const getSavedTaxClaimablePercentage = (enteredAmount: string, rate: number) => (Number(enteredAmount) * 100) / rate;

            it('should return true when the reclaimable amount matches the snapshot', () => {
                // Given a fuel band copied with the government reclaimable fraction
                const rate = buildFuelBandRate(1 / 6);

                // When checking whether it is unmodified
                const isUnmodified = isGovernmentRateUnmodified(rate);

                // Then it is, so the lightning bolt shows
                expect(isUnmodified).toBe(true);
            });

            it.each(['0.1', '0.10', '0.1000', '0.123', '0.1234'])('matches a restored reclaimable amount of %s regardless of padding', (enteredAmount) => {
                // Given a government snapshot whose reclaimable amount uses two to four meaningful decimals
                const taxClaimablePercentage = getSavedTaxClaimablePercentage(enteredAmount, 14);
                const governmentRate = {...fuelBandGovernmentRate, taxClaimablePercentage};
                const rate = buildRate({rate: 14, startDate: '2026-06-01', endDate: undefined, attributes: {taxClaimablePercentage, governmentRate}}, governmentRate);

                // When checking a rate restored through the editor's amount-to-percentage conversion
                const isUnmodified = isGovernmentRateUnmodified(rate);

                // Then reducing display padding does not remove its government-managed status
                expect(isUnmodified).toBe(true);

                // When the reclaimable amount changes in the fourth decimal place
                const modifiedRate = {...rate, attributes: {...rate.attributes, taxClaimablePercentage: getSavedTaxClaimablePercentage('0.1001', 14)}};

                // Then meaningful precision is still compared rather than rounded to two decimals
                expect(isGovernmentRateUnmodified(modifiedRate)).toBe(false);
            });

            it('should return false when the reclaimable amount was edited', () => {
                // Given a fuel band whose reclaimable amount an admin changed to 0.03
                const rate = buildFuelBandRate(getSavedTaxClaimablePercentage('0.03', 14));

                // When checking whether it is unmodified
                const isUnmodified = isGovernmentRateUnmodified(rate);

                // Then it is not, because the edit page would show a different amount than the government value
                expect(isUnmodified).toBe(false);
            });

            it('should return false when the reclaimable amount was cleared', () => {
                // Given a fuel band whose snapshot has a reclaimable fraction but the rate has none
                const rate = buildFuelBandRate(undefined);

                // When checking whether it is unmodified
                const isUnmodified = isGovernmentRateUnmodified(rate);

                // Then it is not, because a missing reclaimable amount counts as zero
                expect(isUnmodified).toBe(false);
            });

            it('should return true when the admin restores the reclaimable amount the edit page showed', () => {
                // Given a fuel band edited away from its government value
                const editedRate = buildFuelBandRate(getSavedTaxClaimablePercentage('0.03', 14));
                expect(isGovernmentRateUnmodified(editedRate)).toBe(false);

                // When the admin re-enters the shown 0.0233, which saves 2.33p rather than the government's 2.3333p
                const restoredRate = buildFuelBandRate(getSavedTaxClaimablePercentage('0.0233', 14));

                // Then the rate is unmodified again, since amounts are compared at the precision the edit page shows
                expect(isGovernmentRateUnmodified(restoredRate)).toBe(true);
            });

            it('should ignore the reclaimable amount when the snapshot has none', () => {
                // Given a US rate and a fuel band whose snapshots have no reclaimable fraction, where an admin set one on the rate
                const usRate = buildRate({attributes: {taxClaimablePercentage: 0.1, governmentRate: baseGovernmentRate}});
                const fuelBandGovernmentRateWithoutPercentage = {sourceRateID: 'GB_PETROL_UP_TO_1400_2026-06-01', rate: 14, startDate: '2026-06-01'};
                const fuelBandRate = buildRate(
                    {rate: 14, startDate: '2026-06-01', endDate: undefined, attributes: {taxClaimablePercentage: 0.1, governmentRate: fuelBandGovernmentRateWithoutPercentage}},
                    fuelBandGovernmentRateWithoutPercentage,
                );

                // When checking whether they are unmodified
                // Then both are, because there is no government reclaimable amount to compare against
                expect(isGovernmentRateUnmodified(usRate)).toBe(true);
                expect(isGovernmentRateUnmodified(fuelBandRate)).toBe(true);
            });
        });
    });

    describe('getGovernmentRateSeries', () => {
        it('should strip only the trailing start date from the sourceRateID', () => {
            // Given a standard rate, a fuel band whose name contains underscores, and an ID without a date
            // When getting their series
            // Then only the part after the last underscore is removed
            expect(getGovernmentRateSeries('GB_2026-04-06')).toBe('GB');
            expect(getGovernmentRateSeries('GB_PETROL_UP_TO_1400_2026-06-01')).toBe('GB_PETROL_UP_TO_1400');
            expect(getGovernmentRateSeries('GB')).toBe('GB');
        });
    });

    describe('getGovernmentRateCountryForCurrency', () => {
        it('should map each supported currency to the country that publishes its rates', () => {
            expect(getGovernmentRateCountryForCurrency('USD')).toBe('US');
            expect(getGovernmentRateCountryForCurrency('CAD')).toBe('CA');
            expect(getGovernmentRateCountryForCurrency('GBP')).toBe('GB');
            expect(getGovernmentRateCountryForCurrency('AUD')).toBe('AU');
            expect(getGovernmentRateCountryForCurrency('NOK')).toBe('NO');
            expect(getGovernmentRateCountryForCurrency('SEK')).toBe('SE');
            expect(getGovernmentRateCountryForCurrency('ZAR')).toBe('ZA');
        });

        it('should return undefined for an unsupported or missing currency', () => {
            expect(getGovernmentRateCountryForCurrency('NZD')).toBeUndefined();
            expect(getGovernmentRateCountryForCurrency('')).toBeUndefined();
            expect(getGovernmentRateCountryForCurrency(undefined)).toBeUndefined();
        });
    });

    describe('isCurrencySupportedForAutoUpdate', () => {
        it('should return true only for the supported currencies', () => {
            expect(isCurrencySupportedForAutoUpdate('USD')).toBe(true);
            expect(isCurrencySupportedForAutoUpdate('CAD')).toBe(true);
            expect(isCurrencySupportedForAutoUpdate('GBP')).toBe(true);
            expect(isCurrencySupportedForAutoUpdate('AUD')).toBe(true);
            expect(isCurrencySupportedForAutoUpdate('NOK')).toBe(true);
            expect(isCurrencySupportedForAutoUpdate('SEK')).toBe(true);
            expect(isCurrencySupportedForAutoUpdate('ZAR')).toBe(true);
            expect(isCurrencySupportedForAutoUpdate('NZD')).toBe(false);
            expect(isCurrencySupportedForAutoUpdate(undefined)).toBe(false);
        });
    });

    describe('getExpectedUnitForCountry', () => {
        it('should return the unit a saved government rate switches the workspace to', () => {
            // Given countries whose governments publish their rates in different units
            // When the Add rate page shows a government rate for each of them
            // Then the amount is shown in the unit the save applies, even when the workspace uses the other unit
            expect(getExpectedUnitForCountry('US')).toBe('mi');
            expect(getExpectedUnitForCountry('CA')).toBe('km');
            expect(getExpectedUnitForCountry('DE')).toBe('km');
        });

        it('should return undefined when there is no government rate country', () => {
            // Given no country or a country without a government rate
            // When the unit is looked up
            // Then there is no unit to switch to, so the page keeps the workspace unit
            expect(getExpectedUnitForCountry(undefined)).toBeUndefined();
            expect(getExpectedUnitForCountry('NZ')).toBeUndefined();
        });
    });

    describe('getExpectedUnitForCurrency', () => {
        it('should return the unit each government publishes its rates in', () => {
            expect(getExpectedUnitForCurrency('USD')).toBe('mi');
            expect(getExpectedUnitForCurrency('GBP')).toBe('mi');
            expect(getExpectedUnitForCurrency('CAD')).toBe('km');
            expect(getExpectedUnitForCurrency('AUD')).toBe('km');
            expect(getExpectedUnitForCurrency('NOK')).toBe('km');
            expect(getExpectedUnitForCurrency('SEK')).toBe('km');
            expect(getExpectedUnitForCurrency('ZAR')).toBe('km');
        });

        it('should return undefined for an unsupported currency', () => {
            expect(getExpectedUnitForCurrency('NZD')).toBeUndefined();
        });
    });

    describe('getGovernmentRateCountryPhraseTranslationKey', () => {
        it('should return the country phrase key for a supported country', () => {
            expect(getGovernmentRateCountryPhraseTranslationKey('US')).toBe('workspace.distanceRates.governmentRateCountries.US');
            expect(getGovernmentRateCountryPhraseTranslationKey('GB')).toBe('workspace.distanceRates.governmentRateCountries.GB');
        });

        it('should return undefined for a missing country', () => {
            expect(getGovernmentRateCountryPhraseTranslationKey(undefined)).toBeUndefined();
        });
    });

    describe('isMapOrGPSRequired', () => {
        const buildPolicy = (policy: Partial<Policy>): Policy => ({...createRandomPolicy(0), ...policy});

        it('should return true when the workspace has the setting enabled', () => {
            expect(isMapOrGPSRequired(buildPolicy({requireMapOrGPS: true}))).toBe(true);
        });

        it('should return true when the workspace excludes commutes, even with the setting off', () => {
            const policy = buildPolicy({
                requireMapOrGPS: false,
                commuterExclusions: {method: 'fixedDistance', fixedDistance: 10, fixedDistanceUnit: 'mi'},
            });

            expect(isMapOrGPSRequired(policy)).toBe(true);
        });

        it('should return false when neither the setting nor commuter exclusions are set', () => {
            expect(isMapOrGPSRequired(buildPolicy({}))).toBe(false);
        });

        it('should return false without a policy', () => {
            expect(isMapOrGPSRequired(undefined)).toBe(false);
        });
    });

    describe('getDistanceExpenseTypeForPolicy', () => {
        const buildPolicy = (policy: Partial<Policy>): Policy => ({...createRandomPolicy(0), ...policy});

        it('should keep the remembered type when the workspace does not require GPS or map entry', () => {
            const policy = buildPolicy({requireMapOrGPS: false});

            expect(getDistanceExpenseTypeForPolicy(policy, CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL)).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL);
            expect(getDistanceExpenseTypeForPolicy(policy, CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER)).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER);
        });

        it('should fall back to map when the workspace starts requiring GPS or map entry', () => {
            const policy = buildPolicy({requireMapOrGPS: true});

            expect(getDistanceExpenseTypeForPolicy(policy, CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL)).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE_MAP);
            expect(getDistanceExpenseTypeForPolicy(policy, CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER)).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE_MAP);
        });

        it('should fall back to map when commuter exclusions require it', () => {
            const policy = buildPolicy({commuterExclusions: {method: 'fixedDistance', fixedDistance: 10, fixedDistanceUnit: 'mi'}});

            expect(getDistanceExpenseTypeForPolicy(policy, CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL)).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE_MAP);
        });

        it('should leave map and GPS types untouched', () => {
            const policy = buildPolicy({requireMapOrGPS: true});

            expect(getDistanceExpenseTypeForPolicy(policy, CONST.IOU.REQUEST_TYPE.DISTANCE_MAP)).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE_MAP);
            expect(getDistanceExpenseTypeForPolicy(policy, CONST.IOU.REQUEST_TYPE.DISTANCE_GPS)).toBe(CONST.IOU.REQUEST_TYPE.DISTANCE_GPS);
        });

        it('should pass through an unset preference', () => {
            expect(getDistanceExpenseTypeForPolicy(buildPolicy({requireMapOrGPS: true}), undefined)).toBeUndefined();
        });
    });

    describe('getDistanceRateNameError', () => {
        const existingRateNames = ['IRS', 'Custom rate'];

        it('should return required when the name is empty or only whitespace', () => {
            expect(getDistanceRateNameError(existingRateNames, '')).toBe(CONST.INPUT_VALIDATION_ERRORS.REQUIRED);
            expect(getDistanceRateNameError(existingRateNames, '   ')).toBe(CONST.INPUT_VALIDATION_ERRORS.REQUIRED);
            expect(getDistanceRateNameError(existingRateNames, '\u200B')).toBe(CONST.INPUT_VALIDATION_ERRORS.REQUIRED);
        });

        it('should return existing when the name matches another rate', () => {
            expect(getDistanceRateNameError(existingRateNames, 'IRS')).toBe(CONST.INPUT_VALIDATION_ERRORS.EXISTING);
            expect(getDistanceRateNameError(existingRateNames, ' Custom rate ')).toBe(CONST.INPUT_VALIDATION_ERRORS.EXISTING);
        });

        it('should not flag a rate as a duplicate of its own name', () => {
            expect(getDistanceRateNameError(existingRateNames, 'IRS', 'IRS')).toBeUndefined();
        });

        it('should return tooLong when the name exceeds the character limit', () => {
            const tooLongName = 'a'.repeat(CONST.TAX_RATES.NAME_MAX_LENGTH + 1);
            expect(getDistanceRateNameError(existingRateNames, tooLongName)).toBe(CONST.INPUT_VALIDATION_ERRORS.TOO_LONG);
        });

        it('should accept a unique name within the character limit', () => {
            expect(getDistanceRateNameError(existingRateNames, 'New rate')).toBeUndefined();
        });

        it('flags an HTML-like name the Name page already rejects', () => {
            // Given a distance rate the admin is renaming from the table
            // When the new name is an HTML-like token such as </>
            // Then the name is invalid, because the Name page blocks it and the table must not save it
            expect(getDistanceRateNameError(existingRateNames, '</>', 'IRS')).toBe(CONST.INPUT_VALIDATION_ERRORS.INVALID);
        });

        it('allows a whitelisted angle-bracket token', () => {
            // Given a distance rate the admin is renaming
            // When the new name is a harmless token the Name page already allows, such as <>
            // Then the name is valid, so the table and the Name page stay in agreement
            expect(getDistanceRateNameError(existingRateNames, '<>', 'IRS')).toBeUndefined();
        });
    });

    describe('getDistanceRateValueError', () => {
        const toLocaleDigit = (digit: string) => digit;

        it('should return invalid when the rate is empty or not a number', () => {
            expect(getDistanceRateValueError('', toLocaleDigit)).toBe(CONST.INPUT_VALIDATION_ERRORS.INVALID);
            expect(getDistanceRateValueError('abc', toLocaleDigit)).toBe(CONST.INPUT_VALIDATION_ERRORS.INVALID);
        });

        it('should return tooLow when the rate is zero or negative', () => {
            expect(getDistanceRateValueError('0', toLocaleDigit)).toBe(CONST.INPUT_VALIDATION_ERRORS.TOO_LOW);
            expect(getDistanceRateValueError('-1', toLocaleDigit)).toBe(CONST.INPUT_VALIDATION_ERRORS.TOO_LOW);
        });

        it('should return invalid when the rate has more than four decimal places', () => {
            expect(getDistanceRateValueError('0.12345', toLocaleDigit)).toBe(CONST.INPUT_VALIDATION_ERRORS.INVALID);
        });

        it('should accept a positive rate with up to four decimal places', () => {
            expect(getDistanceRateValueError('0.67', toLocaleDigit)).toBeUndefined();
            expect(getDistanceRateValueError('0.6700', toLocaleDigit)).toBeUndefined();
        });
    });

    describe('getDistanceRateValueErrorMessage', () => {
        it('uses the same copy as the distance rate edit form', () => {
            // Given the two reasons a distance rate amount can be rejected
            // When the table toast and the edit form ask for the message
            // Then each reason maps to the form's copy, so the two surfaces cannot drift
            expect(getDistanceRateValueErrorMessage(translateLocal, CONST.INPUT_VALIDATION_ERRORS.INVALID)).toBe(translateLocal('common.error.invalidRateError'));
            expect(getDistanceRateValueErrorMessage(translateLocal, CONST.INPUT_VALIDATION_ERRORS.TOO_LOW)).toBe(translateLocal('common.error.lowRateError'));
        });
    });

    describe('getDistanceRateCountryForCurrency', () => {
        const currencyList: CurrencyList = {
            JPY: {symbol: '¥', name: 'Japanese Yen', ISO4217: '392', countries: ['JP']},
            XOF: {symbol: 'CFA', name: 'West African CFA Franc', ISO4217: '952', countries: ['BJ', 'BF', 'CI', 'ML', 'NE', 'SN', 'TG']},
        };

        it('uses the government rate country for a supported currency', () => {
            // Given a currency Expensify publishes a government rate for
            // When we look up its country
            // Then it maps to the publishing country without needing the currency list
            expect(getDistanceRateCountryForCurrency(CONST.CURRENCY.GBP, undefined)).toBe('GB');
        });

        it('uses the only country of a single-country currency', () => {
            // Given a currency used by one country
            // When we look up its country
            // Then that country is returned
            expect(getDistanceRateCountryForCurrency('JPY', currencyList)).toBe('JP');
        });

        it('returns undefined for a currency shared by several countries', () => {
            // Given a currency used by several countries
            // When we look up its country
            // Then there is no single country, so the page shows "Other country"
            expect(getDistanceRateCountryForCurrency('XOF', currencyList)).toBeUndefined();
        });
    });

    describe('getDefaultEuroDistanceRateCountry', () => {
        it('keeps the auto-update country when the workspace already has a government rate', () => {
            // Given an EUR workspace auto-updating German rates with a French company address
            const policy: Policy = {
                ...createRandomPolicy(1),
                outputCurrency: CONST.CURRENCY.EUR,
                shouldAutoUpdateGovernmentDistanceRates: true,
                autoUpdateGovernmentRateCountry: 'DE',
                address: {addressStreet: '', city: '', state: '', zipCode: '', country: 'FR'},
            };

            // When we pick the default country
            // Then the government rate's country wins, so Add rate matches Settings
            expect(getDefaultEuroDistanceRateCountry(policy, 'IE')).toBe('DE');
        });

        it('prefers the company address, then the IP address, then Austria', () => {
            // Given an EUR workspace without a government rate
            const policy: Policy = {...createRandomPolicy(1), outputCurrency: CONST.CURRENCY.EUR, shouldAutoUpdateGovernmentDistanceRates: false};
            const policyInFrance: Policy = {...policy, address: {addressStreet: '', city: '', state: '', zipCode: '', country: 'FR'}};
            const policyInUS: Policy = {...policy, address: {addressStreet: '', city: '', state: '', zipCode: '', country: 'US'}};

            // When we pick the default country
            // Then a euro company address wins, a non-euro one falls through to the IP country, and Austria is the last resort
            expect(getDefaultEuroDistanceRateCountry(policyInFrance, 'IE')).toBe('FR');
            expect(getDefaultEuroDistanceRateCountry(policyInUS, 'IE')).toBe('IE');
            expect(getDefaultEuroDistanceRateCountry(policyInUS, 'US')).toBe('AT');
        });
    });

    describe('isGovernmentRateCountry', () => {
        it('only accepts the countries Expensify publishes government rates for', () => {
            // Given a supported single-currency country, a supported euro country and an unsupported euro country
            // When we check each one
            // Then only the supported ones are accepted
            expect(isGovernmentRateCountry('US')).toBe(true);
            expect(isGovernmentRateCountry('DE')).toBe(true);
            expect(isGovernmentRateCountry('IE')).toBe(false);
            expect(isGovernmentRateCountry(undefined)).toBe(false);
        });
    });

    describe('getCurrentGovernmentMileageRate', () => {
        const rates: GovernmentMileageRate[] = [
            {sourceRateID: 'GB_2025-04-06', currency: 'GBP', name: '2025 UK', rate: 45, startDate: '2025-04-06'},
            {sourceRateID: 'GB_2026-04-06', currency: 'GBP', name: '2026 UK', rate: 55, startDate: '2026-04-06'},
            {sourceRateID: 'GB_2027-04-06', currency: 'GBP', name: '2027 UK', rate: 60, startDate: '2027-04-06'},
            {sourceRateID: 'GB_PETROL_1400CC_2026-04-06', currency: 'GBP', name: 'UK petrol', rate: 12, startDate: '2026-04-06'},
            {sourceRateID: 'DE_2026-01-01', currency: 'EUR', name: '2026 Germany', rate: 30, startDate: '2026-01-01'},
        ];

        it('picks the latest rate that has already started and skips fuel bands', () => {
            // Given past, current and future UK rates plus a UK fuel band
            // When we look up the rate in effect on a date in 2026
            const currentRate = getCurrentGovernmentMileageRate(rates, 'GBP', 'GB', '2026-11-11');

            // Then the 2026 car rate is used, not the future rate or the fuel band
            expect(currentRate?.sourceRateID).toBe('GB_2026-04-06');
        });

        it('returns undefined when the country has no loaded rate', () => {
            // Given rates that were loaded for other countries only
            // When we look up a euro country with no rate in the list
            // Then nothing is returned, so the page keeps its skeleton and Save stays disabled
            expect(getCurrentGovernmentMileageRate(rates, 'EUR', 'NL', '2026-11-11')).toBeUndefined();
        });
    });

    describe('getCurrentFuelBandGovernmentRates', () => {
        it('picks the current rate of each fuel band in the order the bands are listed', () => {
            // Given two quarters of two fuel bands, a future quarter, the standard UK rate and another currency's rate
            const rates: GovernmentMileageRate[] = [
                {sourceRateID: 'GB_DIESEL_1600CC_2026-06-01', currency: 'GBP', name: 'Diesel', rate: 45, startDate: '2026-06-01', taxClaimablePercentage: 0.3},
                {sourceRateID: 'GB_PETROL_1400CC_2026-06-01', currency: 'GBP', name: 'Petrol', rate: 45, startDate: '2026-06-01', taxClaimablePercentage: 0.28},
                {sourceRateID: 'GB_DIESEL_1600CC_2026-09-01', currency: 'GBP', name: 'Diesel', rate: 45, startDate: '2026-09-01', taxClaimablePercentage: 0.33},
                {sourceRateID: 'GB_DIESEL_1600CC_2026-12-01', currency: 'GBP', name: 'Diesel', rate: 45, startDate: '2026-12-01', taxClaimablePercentage: 0.35},
                {sourceRateID: 'GB_2026-04-06', currency: 'GBP', name: '2026 UK', rate: 45, startDate: '2026-04-06'},
                {sourceRateID: 'DE_2026-01-01', currency: 'EUR', name: '2026 Germany', rate: 30, startDate: '2026-01-01'},
            ];

            // When we look up the bands in effect on a date in November 2026
            const currentRates = getCurrentFuelBandGovernmentRates(rates, 'GBP', '2026-11-11');

            // Then each band shows once with its latest started quarter, so the table matches the bands saving adds
            expect(currentRates.map((rate) => rate.sourceRateID)).toEqual(['GB_DIESEL_1600CC_2026-09-01', 'GB_PETROL_1400CC_2026-06-01']);
        });
    });

    describe('getUKFuelVATTaxRateCode', () => {
        it('picks the first enabled 20% tax rate whatever its name', () => {
            // Given a disabled 20% rate, a 5% rate and an enabled 20% rate an integration imported
            const policy = {
                ...createRandomPolicy(1),
                taxRates: {
                    name: 'Tax',
                    defaultExternalID: 'id_EXEMPT',
                    defaultValue: '0%',
                    foreignTaxDefault: 'id_EXEMPT',
                    taxes: {
                        id_OLD_VAT: {name: 'Old VAT', value: '20%', isDisabled: true},
                        id_REDUCED: {name: 'Reduced', value: '5%'},
                        id_XERO_VAT: {name: '20% (VAT on Expenses)', value: '20%'},
                    },
                },
            } satisfies Policy;

            // When we look for the rate VAT on fuel links to
            // Then the enabled 20% rate is used, because a disabled rate can't be picked on an expense
            expect(getUKFuelVATTaxRateCode(policy)).toBe('id_XERO_VAT');
        });

        it('returns undefined when the workspace has no enabled 20% rate', () => {
            // Given a workspace with only a 5% rate
            const policy = {
                ...createRandomPolicy(1),
                taxRates: {name: 'Tax', defaultExternalID: 'id_REDUCED', defaultValue: '5%', foreignTaxDefault: 'id_REDUCED', taxes: {id_REDUCED: {name: 'Reduced', value: '5%'}}},
            } satisfies Policy;

            // When we look for the rate VAT on fuel links to
            // Then there is none, so Add rate offers to add Standard VAT (20%) instead
            expect(getUKFuelVATTaxRateCode(policy)).toBeUndefined();
        });
    });

    describe('validateCreateDistanceRateForm with VAT reclaim', () => {
        const values = {name: 'Field team', rate: '0.20', startDate: '', endDate: ''};

        it('requires a tax reclaimable amount', () => {
            // Given a UK custom rate reclaiming VAT with a zero tax reclaimable amount
            // When the form is validated
            const errors = validateCreateDistanceRateForm({...values, taxClaimableValue: '0'}, (digit) => digit, translateLocal, [], 'GBP', true);

            // Then the amount is required, since a zero amount reclaims nothing
            expect(errors.taxClaimableValue).toBe(translateLocal('workspace.distanceRates.errors.taxReclaimableRequired'));
        });

        it('rejects an amount more than the rate and allows one equal to it', () => {
            // Given a £0.20 rate
            // When the tax reclaimable amount is above it, then equal to it
            const aboveErrors = validateCreateDistanceRateForm({...values, taxClaimableValue: '0.21'}, (digit) => digit, translateLocal, [], 'GBP', true);
            const equalErrors = validateCreateDistanceRateForm({...values, taxClaimableValue: '0.20'}, (digit) => digit, translateLocal, [], 'GBP', true);

            // Then only the amount above the rate is an error, and it names the rate
            expect(aboveErrors.taxClaimableValue).toBe(translateLocal('workspace.distanceRates.errors.taxReclaimableMoreThanRate', '£0.20'));
            expect(equalErrors.taxClaimableValue).toBeUndefined();
        });

        it("skips the amount when the rate doesn't reclaim VAT", () => {
            // Given a rate with VAT reclaim off and no tax reclaimable amount
            // When the form is validated
            const errors = validateCreateDistanceRateForm({...values, taxClaimableValue: ''}, (digit) => digit, translateLocal, [], 'GBP');

            // Then there's no tax error, because the field isn't shown
            expect(errors.taxClaimableValue).toBeUndefined();
        });
    });

    describe('getNoGovernmentRateNote', () => {
        it('explains the missing government rate for each kind of country', () => {
            // Given a country with its own note, a country without one, and an unknown country
            // When we build the note
            // Then each one gets the matching copy
            expect(getNoGovernmentRateNote(translateLocal, 'FR')).toBe(translateLocal('workspace.distanceRates.addRatePage.noGovernmentRateNotes.FR'));
            expect(getNoGovernmentRateNote(translateLocal, 'IE')).toBe(translateLocal('workspace.distanceRates.addRatePage.noGovernmentRateForCountry', translateLocal('allCountries.IE')));
            expect(getNoGovernmentRateNote(translateLocal, undefined)).toBe(translateLocal('workspace.distanceRates.addRatePage.noGovernmentRateForOtherCountry'));
        });
    });

    describe('getGovernmentRateNote', () => {
        const belgiumRate: GovernmentMileageRate = {sourceRateID: 'BE_2026-07-01', currency: 'EUR', name: '2026 Belgium', rate: 43.69, startDate: '2026-07-01'};
        const swedenRate: GovernmentMileageRate = {sourceRateID: 'SE_2026-01-01', currency: 'SEK', name: '2026 Sweden', rate: 250, startDate: '2026-01-01'};

        it('shows a fixed note for countries whose rules do not depend on the rate', () => {
            // Given a country with a fixed note, before its rate has loaded
            // When we build the note
            // Then the note is shown without waiting for the rate
            expect(hasGovernmentRateNote('NO')).toBe(true);
            expect(getGovernmentRateNote(translateLocal, 'NO', undefined, undefined)).toBe(translateLocal('workspace.distanceRates.addRatePage.governmentRateNotes.NO'));
        });

        it('builds the Belgium and Sweden notes from the rate once it loads', () => {
            // Given Belgium and Sweden, whose notes quote the published rate
            // When we build the notes before and after the rate loads
            // Then they wait for the rate, then show its start date and its amount per Swedish mil
            expect(hasGovernmentRateNote('BE')).toBe(true);
            expect(hasGovernmentRateNote('SE')).toBe(true);
            expect(getGovernmentRateNote(translateLocal, 'BE', undefined, undefined)).toBeUndefined();
            expect(getGovernmentRateNote(translateLocal, 'SE', undefined, undefined)).toBeUndefined();
            expect(getGovernmentRateNote(translateLocal, 'BE', belgiumRate, undefined)).toBe(
                translateLocal('workspace.distanceRates.addRatePage.governmentRateIndexedQuarterly', 'July 1, 2026'),
            );
            expect(getGovernmentRateNote(translateLocal, 'SE', swedenRate, undefined)).toBe(translateLocal('workspace.distanceRates.addRatePage.governmentRatePerSwedishMil', 'SEK 25.00'));
        });

        it('has no note for countries whose rate needs no explanation', () => {
            // Given a country the summary shows only the unit line for
            // When we check for a note
            // Then there is none, so no loading line is shown either
            expect(hasGovernmentRateNote('US')).toBe(false);
            expect(getGovernmentRateNote(translateLocal, 'US', undefined, undefined)).toBeUndefined();
        });
    });
});
