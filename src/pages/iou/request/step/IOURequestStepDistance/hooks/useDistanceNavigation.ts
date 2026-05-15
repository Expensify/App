import {hasSeenTourSelector} from '@selectors/Onboarding';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import useOnyx from '@hooks/useOnyx';
import {handleMoneyRequestStepDistanceNavigation} from '@libs/actions/IOU/MoneyRequest';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Beta, IntroSelected, PersonalDetailsList, Policy, RecentWaypoint, Report, Transaction} from '@src/types/onyx';
import type {ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';
import type {Participant} from '@src/types/onyx/IOU';
import type {WaypointCollection} from '@src/types/onyx/Transaction';

type UseDistanceNavigationParams = {
    /** Type of IOU flow (request, split, track, etc.). */
    iouType: IOUType;

    /** The chat/expense report that owns this transaction. */
    report: OnyxEntry<Report>;

    /** The workspace policy this transaction belongs to, if any. */
    policy: OnyxEntry<Policy>;

    /** The transaction being submitted. */
    transaction: OnyxEntry<Transaction>;

    /** Route param: the originating reportID. */
    reportID: string;

    /** Route param: the transactionID being acted upon. */
    transactionID: string;

    /** Derived report attributes used by the navigation utility for participant resolution. */
    reportAttributesDerived: ReportAttributesDerivedValue['reports'] | undefined;

    /** All personal details — used to resolve participants when there is no policy. */
    personalDetails: OnyxEntry<PersonalDetailsList>;

    /** All waypoints currently in the editor (including any optimistic ones). */
    waypoints: WaypointCollection;

    /** Current user's email — passed through to the navigation util. */
    currentUserLogin: string;

    /** Current user's account ID — passed through to the navigation util. */
    currentUserAccountID: number;

    /** Optional route to return to instead of going forward. */
    backTo: Route | undefined;

    /** Optional report to return to after submission completes. */
    backToReport: string | undefined;

    /** True when the quick-action flow should bypass the confirmation screen. */
    shouldSkipConfirmation: boolean;

    /** Fallback policy when the transaction has no associated workspace. */
    defaultExpensePolicy: OnyxEntry<Policy>;

    /** True when the parent report is archived — disables certain submit paths. */
    isArchived: boolean;

    /** True when the personal policy auto-creates and submits reports. */
    isAutoReporting: boolean;

    /** True when the ASAP-submit beta is enabled. */
    isASAPSubmitBetaEnabled: boolean;

    /** Setter that primes amount + split shares before navigation; provided by `useDistanceRequestData`. */
    setDistanceRequestData: (participants: Participant[]) => void;

    /** Locale translator for any user-facing strings the navigation may surface. */
    translate: LocaleContextProps['translate'];

    /** Concierge / self-DM report — used as the destination for unreported expenses. */
    selfDMReport: OnyxEntry<Report>;

    /** Resolved policy from `usePolicyForMovingExpenses` — the workspace a new report should land in. */
    policyForMovingExpenses: OnyxEntry<Policy>;

    /** Enabled betas — passed through to downstream API calls. */
    betas: OnyxEntry<Beta[]>;

    /** Recently-used waypoints — passed through so the next screen can suggest them. */
    recentWaypoints: OnyxEntry<RecentWaypoint[]>;

    /** Onboarding selection — passed through to downstream API calls. */
    introSelected: OnyxEntry<IntroSelected>;
};

function useDistanceNavigation({
    iouType,
    report,
    policy,
    transaction,
    reportID,
    transactionID,
    reportAttributesDerived,
    personalDetails,
    waypoints,
    currentUserLogin,
    currentUserAccountID,
    backTo,
    backToReport,
    shouldSkipConfirmation,
    defaultExpensePolicy,
    isArchived,
    isAutoReporting,
    isASAPSubmitBetaEnabled,
    setDistanceRequestData,
    translate,
    selfDMReport,
    policyForMovingExpenses,
    betas,
    recentWaypoints,
    introSelected,
}: UseDistanceNavigationParams): () => void {
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);

    return () => {
        handleMoneyRequestStepDistanceNavigation({
            iouType,
            report,
            policy,
            transaction,
            reportID,
            transactionID,
            reportAttributesDerived,
            personalDetails,
            waypoints,
            currentUserLogin,
            currentUserAccountID,
            backTo,
            backToReport,
            shouldSkipConfirmation,
            defaultExpensePolicy,
            isArchivedExpenseReport: isArchived,
            isAutoReporting,
            isASAPSubmitBetaEnabled,
            transactionViolations,
            lastSelectedDistanceRates,
            setDistanceRequestData,
            translate,
            quickAction,
            policyRecentlyUsedCurrencies,
            introSelected,
            privateIsArchived: isArchived,
            selfDMReport,
            policyForMovingExpenses,
            betas,
            recentWaypoints,
            draftTransactionIDs,
            isSelfTourViewed: !!isSelfTourViewed,
            amountOwed,
            userBillingGracePeriodEnds,
            ownerBillingGracePeriodEnd,
            conciergeReportID,
        });
    };
}

export default useDistanceNavigation;
