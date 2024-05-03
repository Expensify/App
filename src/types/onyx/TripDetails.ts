type DateISO8601 = {
    iso8601: string;
};

type BasicTripInfo = {
    tripId: string;
    tripName: string;
    tripDescription: string;
    applicationId: string;
    startDate: DateISO8601;
    endDate: DateISO8601;
};

type IdType = {
    id: string;
};

type EventSummary = {
    id: string;
    name: string;
    description: string;
    startDateTime: DateISO8601;
    endDateTime: DateISO8601;
    location: unknown;
    contacts: IdType[];
    documents: unknown[];
    bookingGuidelines: unknown[];
    allowedBookingTypes: unknown[];
    eventUserRsvp: unknown;
    contactInfoList: unknown;
    companyId: IdType;
    runningStatus: string;
    status: string;
    isRemovedParticipant: boolean;
};

type TripStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'ACTIVE'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'REFUNDED'
    | 'VOIDED'
    | 'PROCESSING'
    | 'UNCONFIRMED'
    | 'AIRLINE_CONTROL'
    | 'PAYMENT_DECLINED'
    | 'SCHEDULE_CHANGE'
    | 'UNKNOWN'
    | 'HOLD'
    | 'APPROVAL_REQUESTED'
    | 'APPROVAL_DENIED'
    | 'CANCELLATION_IN_PROGRESS'
    | 'INOPERATIVE_STATUS'
    | 'FLIGHT_UNCONFIRMED_STATUS';

type TripBookingStatus =
    | 'UNKNOWN_STATUS'
    | 'PENDING_STATUS'
    | 'CONFIRMED_STATUS'
    | 'ACTIVE_STATUS'
    | 'COMPLETED_STATUS'
    | 'CANCELLED_STATUS'
    | 'REFUNDED_STATUS'
    | 'VOIDED_STATUS'
    | 'PROCESSING_STATUS'
    | 'UNCONFIRMED_STATUS'
    | 'AIRLINE_CONTROL_STATUS'
    | 'PAYMENT_DECLINED_STATUS'
    | 'SCHEDULE_CHANGE_STATUS'
    | 'HOLD_STATUS'
    | 'APPROVAL_REQUESTED_STATUS'
    | 'APPROVAL_DENIED_STATUS'
    | 'CANCELLATION_IN_PROGRESS_STATUS'
    | 'INOPERATIVE_STATUS'
    | 'FLIGHT_UNCONFIRMED_STATUS';

type TripDetails = {
    basicTripInfo: BasicTripInfo;
    pnrs: unknown[];
    pendingShellPnrs: unknown[];
    pendingManualFormPnrs: unknown[];
    tripStatus: TripStatus;
    tripBookingStatus: TripBookingStatus;
    eventSummary: EventSummary;
    simplePnrs: unknown[];
};

export type {TripDetails, EventSummary, BasicTripInfo};
