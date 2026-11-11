import * as API from '@libs/API';
import type {AcceptSpotnanaTermsParams, ApproveTravelBookingsParams, RejectTravelBookingParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import type {TripRoomData} from '@libs/TravelApprovalUtils';
import {canApproveAnyBooking, getTripStatusFromBookings} from '@libs/TravelApprovalUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import type {BookingApproval} from '@src/types/onyx/ReportNameValuePairs';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';

import type {NullishDeep, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

import {getAllSnapshots} from './IOU';

/**
 * Accept Spotnana terms and conditions to receive a proper token used for authenticating further actions
 */
function acceptSpotnanaTerms(domain?: string, policyID?: string, taxID?: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_TRAVEL_SETTINGS | typeof ONYXKEYS.TRAVEL_PROVISIONING>> = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.NVP_TRAVEL_SETTINGS,
            value: {
                hasAcceptedTerms: true,
            },
        },
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.TRAVEL_PROVISIONING,
            value: {
                isLoading: true,
                errors: null,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.TRAVEL_PROVISIONING | typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.TRAVEL_PROVISIONING,
            value: {
                isLoading: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                travelSettings: {
                    hasAcceptedTerms: true,
                    ...(taxID ? {taxID} : {}),
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_TRAVEL_SETTINGS | typeof ONYXKEYS.TRAVEL_PROVISIONING>> = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.NVP_TRAVEL_SETTINGS,
            value: {
                hasAcceptedTerms: false,
            },
        },
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.TRAVEL_PROVISIONING,
            value: {
                isLoading: false,
            },
        },
    ];

    const params: AcceptSpotnanaTermsParams = {domainName: domain, policyID, taxID};

    // We need to call this API immediately to get the response and open the travel page.
    // See https://github.com/Expensify/App/pull/69769#discussion_r2368967354 for more info.
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.ACCEPT_SPOTNANA_TERMS, params, {optimisticData, successData, failureData});
}

/**
 * Requests travel access and resolves whether the account can enable travel straight away. When it can't, the server
 * opens a guide review, so the request time is recorded to show the review is pending. When it can, any pending request
 * time is cleared so the account is no longer shown as under review. Rejects when the server returns an error.
 */
function requestTravelAccess(): Promise<boolean> {
    // We need the response to know whether to send the user to enable travel or show that their request is under review
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REQUEST_TRAVEL_ACCESS, null).then((response) => {
        if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
            throw new Error(response?.message ?? 'RequestTravelAccess failed');
        }
        if (response.canSkipVerification) {
            Onyx.merge(ONYXKEYS.NVP_TRAVEL_SETTINGS, {lastTravelSignupRequestTime: null});
            return true;
        }
        Onyx.merge(ONYXKEYS.NVP_TRAVEL_SETTINGS, {lastTravelSignupRequestTime: Date.now().toString()});
        return false;
    });
}

function setTravelProvisioningTaxID(taxID: string) {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, {taxID});
}

function setTravelProvisioningDomain(domain: string) {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, {domain});
}

function setTravelProvisioningNextStep(nextStepRoute?: Route) {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, {nextStepRoute});
}

function setTravelProvisioningEnabledSteps(enabledSteps: string[]) {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, {enabledSteps});
}

function cleanupTravelProvisioningSession() {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, null);
}

type TravelBookingDecisionParams = {
    /** The trip room whose bookings are decided */
    tripRoomReport: OnyxEntry<Report>;

    /** The trip room's tripData, with the bookings' approval state before the decision */
    tripData: TripRoomData;

    currentUserAccountID: number;
};

type TravelBookingDecisionOnyxKeys = typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.SNAPSHOT;

type BookingDecisionOnyxData = {
    optimisticData: Array<OnyxUpdate<TravelBookingDecisionOnyxKeys>>;
    successData: Array<OnyxUpdate<TravelBookingDecisionOnyxKeys>>;
    failureData: Array<OnyxUpdate<TravelBookingDecisionOnyxKeys>>;
};

type BookingApprovalStatus = ValueOf<typeof CONST.TRAVEL.BOOKING_APPROVAL.STATUS>;

/** The trip's tripData as it will be once the decision applies, used to work out what else the decision changes */
function getTripDataAfterDecision(tripData: TripRoomData, pnrIDs: string[], status: BookingApprovalStatus): TripRoomData {
    if (!tripData) {
        return undefined;
    }

    const previousStates = tripData.bookingApprovalState ?? {};
    const decidedStates: Record<string, BookingApproval> = {...previousStates};
    for (const pnrID of pnrIDs) {
        const previousState = previousStates[pnrID];
        if (previousState) {
            decidedStates[pnrID] = {...previousState, status};
        }
    }
    return {...tripData, bookingApprovalState: decidedStates};
}

/** Every place that shows a booking reads its approval state, so the new status shows everywhere at once, faded until the server confirms */
function buildBookingApprovalStateOnyxData(reportID: string, tripData: TripRoomData, pnrIDs: string[], status: BookingApprovalStatus): BookingDecisionOnyxData {
    const previousStates = tripData?.bookingApprovalState ?? {};
    const optimisticStates: Record<string, NullishDeep<BookingApproval>> = {};
    const successStates: Record<string, NullishDeep<BookingApproval>> = {};
    const failureStates: Record<string, NullishDeep<BookingApproval>> = {};
    for (const pnrID of pnrIDs) {
        optimisticStates[pnrID] = {status, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, errors: null};
        successStates[pnrID] = {pendingAction: null};
        failureStates[pnrID] = {...previousStates[pnrID], pendingAction: null, errors: getMicroSecondOnyxErrorWithTranslationKey('travel.approval.genericError')};
    }

    const key = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}` as const;
    return {
        optimisticData: [{onyxMethod: Onyx.METHOD.MERGE, key, value: {tripData: {bookingApprovalState: optimisticStates}}}],
        successData: [{onyxMethod: Onyx.METHOD.MERGE, key, value: {tripData: {bookingApprovalState: successStates}}}],
        failureData: [{onyxMethod: Onyx.METHOD.MERGE, key, value: {tripData: {bookingApprovalState: failureStates}}}],
    };
}

/** Like expense approvals, the green dot goes away once nothing in the trip waits on the approver */
function buildOutstandingChildRequestOnyxData(tripRoomReport: Report, decidedTripData: TripRoomData, currentUserAccountID: number): BookingDecisionOnyxData {
    if (!tripRoomReport.hasOutstandingChildRequest || canApproveAnyBooking(decidedTripData, currentUserAccountID)) {
        return {optimisticData: [], successData: [], failureData: []};
    }

    const key = `${ONYXKEYS.COLLECTION.REPORT}${tripRoomReport.reportID}` as const;
    return {
        optimisticData: [{onyxMethod: Onyx.METHOD.MERGE, key, value: {hasOutstandingChildRequest: false}}],
        successData: [],
        failureData: [{onyxMethod: Onyx.METHOD.MERGE, key, value: {hasOutstandingChildRequest: true}}],
    };
}

/** Spend trip rows show the status the backend works out for the trip, so update it in every search that has the trip room */
function buildTripStatusSnapshotOnyxData(reportID: string, decidedTripData: TripRoomData): BookingDecisionOnyxData {
    const onyxData: BookingDecisionOnyxData = {optimisticData: [], successData: [], failureData: []};
    const tripStatus = getTripStatusFromBookings(decidedTripData);
    const tripRoomSearchKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const;
    for (const snapshot of Object.values(getAllSnapshots() ?? {})) {
        const snapshotHash = snapshot?.search?.hash;
        const previousTripStatus = snapshot?.data?.[tripRoomSearchKey]?.status;
        if (snapshotHash === undefined || !previousTripStatus || previousTripStatus === CONST.SEARCH.TRIP_STATUS.CANCELED || previousTripStatus === tripStatus) {
            continue;
        }
        const key = `${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}` as const;
        const optimisticSnapshotData: NullishDeep<SearchResultDataType> = {};
        optimisticSnapshotData[tripRoomSearchKey] = {status: tripStatus};
        const failureSnapshotData: NullishDeep<SearchResultDataType> = {};
        failureSnapshotData[tripRoomSearchKey] = {status: previousTripStatus};
        onyxData.optimisticData.push({onyxMethod: Onyx.METHOD.MERGE, key, value: {data: optimisticSnapshotData}});
        onyxData.failureData.push({onyxMethod: Onyx.METHOD.MERGE, key, value: {data: failureSnapshotData}});
    }
    return onyxData;
}

/** Builds the Onyx updates for approving or rejecting bookings. A failure puts the previous state back with an error */
function buildBookingDecisionOnyxData(
    {tripRoomReport, tripData, currentUserAccountID}: TravelBookingDecisionParams,
    pnrIDs: string[],
    status: BookingApprovalStatus,
): BookingDecisionOnyxData {
    const reportID = tripRoomReport?.reportID;
    if (!reportID) {
        return {optimisticData: [], successData: [], failureData: []};
    }

    const decidedTripData = getTripDataAfterDecision(tripData, pnrIDs, status);
    const parts = [
        buildBookingApprovalStateOnyxData(reportID, tripData, pnrIDs, status),
        buildOutstandingChildRequestOnyxData(tripRoomReport, decidedTripData, currentUserAccountID),
        buildTripStatusSnapshotOnyxData(reportID, decidedTripData),
    ];
    return {
        optimisticData: parts.flatMap((part) => part.optimisticData),
        successData: parts.flatMap((part) => part.successData),
        failureData: parts.flatMap((part) => part.failureData),
    };
}

/** Approves the given bookings, and only those, so a booking added after the approver looked isn't approved by mistake */
function approveTravelBookings(decisionParams: TravelBookingDecisionParams, pnrIDs: string[]) {
    const reportID = decisionParams.tripRoomReport?.reportID;
    if (!reportID || pnrIDs.length === 0) {
        return;
    }

    const params: ApproveTravelBookingsParams = {reportID, pnrIDs};
    API.write(WRITE_COMMANDS.APPROVE_TRAVEL_BOOKINGS, params, buildBookingDecisionOnyxData(decisionParams, pnrIDs, CONST.TRAVEL.BOOKING_APPROVAL.STATUS.APPROVED));
}

/** Rejects one booking. The reason is optional */
function rejectTravelBooking(decisionParams: TravelBookingDecisionParams, pnrID: string, reason?: string) {
    const reportID = decisionParams.tripRoomReport?.reportID;
    if (!reportID) {
        return;
    }

    const params: RejectTravelBookingParams = {reportID, pnrID, ...(reason ? {reason} : {})};
    API.write(WRITE_COMMANDS.REJECT_TRAVEL_BOOKING, params, buildBookingDecisionOnyxData(decisionParams, [pnrID], CONST.TRAVEL.BOOKING_APPROVAL.STATUS.REJECTED));
}

export {
    acceptSpotnanaTerms,
    approveTravelBookings,
    rejectTravelBooking,
    cleanupTravelProvisioningSession,
    requestTravelAccess,
    setTravelProvisioningDomain,
    setTravelProvisioningEnabledSteps,
    setTravelProvisioningNextStep,
    setTravelProvisioningTaxID,
};
