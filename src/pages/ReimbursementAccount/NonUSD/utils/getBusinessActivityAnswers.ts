/** AU business activity questions and their answers for Corpay onboarding. */
import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

import type {TupleToUnion} from 'type-fest';

const {
    IS_CLIENT_CHARITABLE_ORGANIZATION,
    IS_CLIENT_DEALER_IN_STONES_PRECIOUS_METALS,
    IS_CLIENT_HIGH_VALUE_DEALER,
    IS_CLIENT_NETWORK_MARKETING_COMPANY,
    IS_CLIENT_REAL_ESTATE_COMPANY,
    IS_CLIENT_TRAVEL_OR_TOUR_COMPANY,
    IS_CLIENT_CANNABIS_RELATED_COMPANY,
    IS_CLIENT_CRYPTO_COMPANY,
    IS_CLIENT_MSBFI,
} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

const BUSINESS_ACTIVITY_FIELDS = [
    {inputID: IS_CLIENT_CHARITABLE_ORGANIZATION, label: 'businessInfoStep.activities.charitableOrganization', sentryLabel: CONST.SENTRY_LABEL.CORPAY_ONBOARDING.CHARITABLE_ORGANIZATION},
    {
        inputID: IS_CLIENT_DEALER_IN_STONES_PRECIOUS_METALS,
        label: 'businessInfoStep.activities.preciousStonesOrMetals',
        sentryLabel: CONST.SENTRY_LABEL.CORPAY_ONBOARDING.PRECIOUS_STONES_OR_METALS,
    },
    {inputID: IS_CLIENT_HIGH_VALUE_DEALER, label: 'businessInfoStep.activities.highValueDealer', sentryLabel: CONST.SENTRY_LABEL.CORPAY_ONBOARDING.HIGH_VALUE_DEALER},
    {inputID: IS_CLIENT_NETWORK_MARKETING_COMPANY, label: 'businessInfoStep.activities.networkMarketing', sentryLabel: CONST.SENTRY_LABEL.CORPAY_ONBOARDING.NETWORK_MARKETING},
    {inputID: IS_CLIENT_REAL_ESTATE_COMPANY, label: 'businessInfoStep.activities.realEstate', sentryLabel: CONST.SENTRY_LABEL.CORPAY_ONBOARDING.REAL_ESTATE},
    {inputID: IS_CLIENT_TRAVEL_OR_TOUR_COMPANY, label: 'businessInfoStep.activities.travelOrTour', sentryLabel: CONST.SENTRY_LABEL.CORPAY_ONBOARDING.TRAVEL_OR_TOUR},
    {inputID: IS_CLIENT_CANNABIS_RELATED_COMPANY, label: 'businessInfoStep.activities.cannabis', sentryLabel: CONST.SENTRY_LABEL.CORPAY_ONBOARDING.CANNABIS},
    {inputID: IS_CLIENT_CRYPTO_COMPANY, label: 'businessInfoStep.activities.crypto', sentryLabel: CONST.SENTRY_LABEL.CORPAY_ONBOARDING.CRYPTO},
    {inputID: IS_CLIENT_MSBFI, label: 'businessInfoStep.activities.moneyServicesOrFinancialInstitution', sentryLabel: CONST.SENTRY_LABEL.CORPAY_ONBOARDING.MONEY_SERVICES},
] as const;

type BusinessActivityField = TupleToUnion<typeof BUSINESS_ACTIVITY_FIELDS>['inputID'];

function getBusinessActivityAnswers(
    draft: Partial<Record<BusinessActivityField, string>> | undefined,
    saved: Partial<Record<BusinessActivityField, boolean>> | undefined,
): Partial<Record<BusinessActivityField, boolean>> {
    const answers: Partial<Record<BusinessActivityField, boolean>> = {};
    for (const {inputID} of BUSINESS_ACTIVITY_FIELDS) {
        const value = draft?.[inputID] ?? saved?.[inputID];
        if (value === 'true' || value === true) {
            answers[inputID] = true;
        } else if (value === 'false' || value === false) {
            answers[inputID] = false;
        }
    }
    return answers;
}

export {BUSINESS_ACTIVITY_FIELDS, getBusinessActivityAnswers};
