import type {deleteMoneyRequest} from '@libs/actions/IOU/DeleteMoneyRequest';
import type {createExpenseByType, duplicateExpenseTransaction} from '@libs/actions/IOU/Duplicate';
import type {initMoneyRequest} from '@libs/actions/IOU/MoneyRequest';
import type {payMoneyRequest} from '@libs/actions/IOU/PayMoneyRequest';
import type * as PerDiemActions from '@libs/actions/IOU/PerDiem';
import type {rejectMoneyRequest} from '@libs/actions/IOU/RejectMoneyRequest';
import type {approveMoneyRequest} from '@libs/actions/IOU/ReportWorkflow';
import type * as SendInvoiceActions from '@libs/actions/IOU/SendInvoice';
import type * as SendMoneyActions from '@libs/actions/IOU/SendMoney';
import type * as SplitActions from '@libs/actions/IOU/Split';
import type * as SplitTransactionUpdateActions from '@libs/actions/IOU/SplitTransactionUpdate';
import type * as TrackExpenseActions from '@libs/actions/IOU/TrackExpense';

import fs from 'fs';
import path from 'path';

/**
 * Architecture guard for issue #84631: navigation belongs in the view layer, not in `src/libs/actions/`.
 * `submitWithDismissFirst` is the view-layer dismiss-first orchestrator; no action file may import it.
 */
const ACTIONS_DIR = path.join(__dirname, '..', '..', 'src', 'libs', 'actions');
const FORBIDDEN_IMPORT = '@libs/Navigation/helpers/submitWithDismissFirst';

/**
 * The layer that navigates is the one that knows a transition is coming, so an action may receive a barrier
 * through a parameter but never build or arm one. Both shapes have to be matched: a named import, and a call
 * through the namespace import that `Split.ts` already uses. A bare identifier match would instead flag
 * `resolveWriteBarrier`, which names `armTransitionBarrier` in a doc comment.
 */
const BARRIER_FACTORY = 'createTransitionBarrier|armTransitionBarrier';
const FORBIDDEN_BARRIER_IMPORT = new RegExp(String.raw`import\s+(?:type\s+)?\{[^}]*\b(?:${BARRIER_FACTORY})\b|\.\s*(?:${BARRIER_FACTORY})\s*\(`);

/**
 * Matching on a leading navigation verb covers the helpers that wrap a route change, such as
 * `dismissModalAndOpenReportInInboxTab`, `navigateAfterExpenseCreate` and `popReportsSplitNavigatorToReport`,
 * without naming each one as it is added. The route-changing methods that do not start with a verb are named.
 */
const ROUTE_CHANGING_CALL = /(\b(navigate|dismiss|goBack|pop|reveal)[A-Za-z]*|Navigation\.(removeScreenByKey|setParams)|navigationRef\.(dispatch|navigate|goBack|reset))\(/;

/**
 * A module under `@libs/Navigation` changes routes unless proven otherwise, so this is the full set a migrated
 * file may import. `Navigation` is here because `TrackExpense` schedules a data side-effect through
 * `setNavigationActionToMicrotaskQueue`, and its route methods are caught by ROUTE_CHANGING_CALL anyway.
 * `TransitionTracker` waits for a transition to end and changes no route.
 */
const ALLOWED_NAVIGATION_IMPORTS = new Set(['@libs/Navigation/Navigation', '@libs/Navigation/TransitionTracker']);
const NAVIGATION_IMPORT = /from ['"](@libs\/Navigation\/[^'"]+)['"]/g;

/**
 * Issue #84631: an action writes data and returns nothing, so a caller is never made to wait on an effect to learn
 * what to do next. Assignability cannot express that rule, because TypeScript deliberately lets `(p) => {id: string}`
 * satisfy `(p) => void`, so these checks read ReturnType instead. `Awaited` keeps async actions passing. The imports
 * are type-only, so no action module is loaded at runtime, and these checks fail under `npm run typecheck`, not Jest.
 */
type NoPayload<F extends (...args: never[]) => unknown> = Awaited<ReturnType<F>> extends void | undefined ? true : {actionMustNotReturnAPayload: true; thisActionReturns: ReturnType<F>};

/** The inverse, so an action that becomes void fails here until its entry is deleted from the list below. */
type HasPayload<F extends (...args: never[]) => unknown> = NoPayload<F> extends true ? {actionNowReturnsNothing: true; deleteItsEntryFromThisList: true} : true;

/**
 * Exhaustive per-module check for the action files whose navigation has already moved. It declares the complete set
 * of exports that return anything, so a newly added action is covered without anybody remembering to list it: a new
 * returning export fails with its own name, and a declared name that becomes void fails too. The modules not listed
 * here still navigate by design until the later PRs in issue #84631, which is when they join. Adding a module here
 * also adds its file to the navigation scans below, so a migrated file always gets both checks.
 */
type ReturningExports<M> = {
    [K in keyof M]-?: M[K] extends (...args: never[]) => unknown ? (Awaited<ReturnType<M[K]>> extends void | undefined ? never : K) : never;
}[keyof M];

type Exhaustive<Actual, Declared> = [Actual] extends [Declared]
    ? [Declared] extends [Actual]
        ? true
        : {declaredButNoLongerReturning: Exclude<Declared, Actual>}
    : {returnsButIsNotDeclared: Exclude<Actual, Declared>};

const RETURNING_EXPORTS_BY_MODULE = {
    Split: true satisfies Exhaustive<ReturningExports<typeof SplitActions>, 'createDistanceRequest' | 'createSplitsAndOnyxData' | 'resolveOptimisticSplitChatReportID'>,
    SplitTransactionUpdate: true satisfies Exhaustive<
        ReturningExports<typeof SplitTransactionUpdateActions>,
        'getExpenseReportIDsEmptiedBySplitUpdate' | 'hasEditableSplitExpenseLeft' | 'willSplitUpdateEmptyExpenseReport'
    >,
    SendInvoice: true satisfies Exhaustive<ReturningExports<typeof SendInvoiceActions>, 'getReceiverType' | 'getSendInvoiceInformation'>,
    SendMoney: true satisfies Exhaustive<ReturningExports<typeof SendMoneyActions>, never>,
    PerDiem: true satisfies Exhaustive<
        ReturningExports<typeof PerDiemActions>,
        'computePerDiemExpenseAmount' | 'getPerDiemExpenseInformation' | 'getPerDiemExpensePolicyID' | 'hasCompletePerDiemCustomUnit' | 'isValidPerDiemExpenseAmount' | 'submitPerDiemExpense'
    >,
    TrackExpense: true satisfies Exhaustive<
        ReturningExports<typeof TrackExpenseActions>,
        | 'deleteTrackExpense'
        | 'getDeleteTrackExpenseInformation'
        | 'getNavigationUrlAfterTrackExpenseDelete'
        | 'getTrackExpenseInformation'
        | 'hasManualDistanceOverride'
        | 'requestMoney'
        | 'trackExpense'
    >,
};

/** Action files whose navigation already moved to the view layer, pinned so they cannot drift back before the ESLint ban lands. */
const MIGRATED_ACTION_FILES = Object.keys(RETURNING_EXPORTS_BY_MODULE).map((module) => `IOU/${module}.ts`);

/**
 * Write-performing actions under `actions/IOU` that still hand a payload back. The list is kept by hand, so it covers
 * only the actions named here. Each entry fails once its action returns nothing, and the fix is to delete the entry. The first four give back the optimistic IOU report that the
 * duplicate batch merges the next expense into, and createExpenseByType and duplicateExpenseTransaction pass it on.
 * initMoneyRequest returns the draft transaction it created. The rest hand the caller a route or report ID to navigate with.
 */
const PAYLOAD_RETURNING_ACTIONS = {
    requestMoney: true satisfies HasPayload<(typeof TrackExpenseActions)['requestMoney']>,
    trackExpense: true satisfies HasPayload<(typeof TrackExpenseActions)['trackExpense']>,
    createDistanceRequest: true satisfies HasPayload<(typeof SplitActions)['createDistanceRequest']>,
    submitPerDiemExpense: true satisfies HasPayload<(typeof PerDiemActions)['submitPerDiemExpense']>,
    deleteMoneyRequest: true satisfies HasPayload<typeof deleteMoneyRequest>,
    deleteTrackExpense: true satisfies HasPayload<(typeof TrackExpenseActions)['deleteTrackExpense']>,
    rejectMoneyRequest: true satisfies HasPayload<typeof rejectMoneyRequest>,
    payMoneyRequest: true satisfies HasPayload<typeof payMoneyRequest>,
    approveMoneyRequest: true satisfies HasPayload<typeof approveMoneyRequest>,
    initMoneyRequest: true satisfies HasPayload<typeof initMoneyRequest>,
    createExpenseByType: true satisfies HasPayload<typeof createExpenseByType>,
    duplicateExpenseTransaction: true satisfies HasPayload<typeof duplicateExpenseTransaction>,
};

function collectSourceFiles(dir: string): string[] {
    return fs.readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            return collectSourceFiles(fullPath);
        }
        return entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') ? [fullPath] : [];
    });
}

function readMigratedActionFile(file: string): string {
    return fs.readFileSync(path.join(ACTIONS_DIR, file), 'utf8');
}

describe('action-layer navigation guard (#84631)', () => {
    it('no file under src/libs/actions imports the view-layer submitWithDismissFirst orchestrator', () => {
        const offenders = collectSourceFiles(ACTIONS_DIR)
            .filter((file) => fs.readFileSync(file, 'utf8').includes(FORBIDDEN_IMPORT))
            .map((file) => path.relative(ACTIONS_DIR, file));

        expect(offenders).toEqual([]);
    });

    it('no file under src/libs/actions builds or arms a navigation transition barrier, by import or through the API namespace', () => {
        // Given every action file, since receiving a barrier is fine anywhere but creating one is a view-layer decision
        const actionFiles = collectSourceFiles(ACTIONS_DIR);

        // When each is scanned for an import of either barrier factory
        const offenders = actionFiles.filter((file) => FORBIDDEN_BARRIER_IMPORT.test(fs.readFileSync(file, 'utf8'))).map((file) => path.relative(ACTIONS_DIR, file));

        // Then none of them builds its own barrier, whichever import shape it uses
        expect(offenders).toEqual([]);
    });

    it('action files that already moved their navigation make no route-changing call', () => {
        // Given every listed file still exists, so renaming or splitting one fails here instead of as an unreadable-file error
        expect(MIGRATED_ACTION_FILES.filter((file) => !fs.existsSync(path.join(ACTIONS_DIR, file)))).toEqual([]);

        // When each is scanned for a route change, whether on the Navigation module, on navigationRef, or through a helper that wraps either
        const offenders = MIGRATED_ACTION_FILES.filter((file) => ROUTE_CHANGING_CALL.test(readMigratedActionFile(file)));

        // Then none of them navigates, dismisses or pops a screen
        expect(offenders).toEqual([]);
    });

    it('action files that already moved their navigation import no route-changing helper', () => {
        // Given the same files, since a helper can be imported under any local name and the call scan above would then miss it
        expect(MIGRATED_ACTION_FILES.filter((file) => !fs.existsSync(path.join(ACTIONS_DIR, file)))).toEqual([]);

        // When every @libs/Navigation import in them is collected
        const navigationImports = MIGRATED_ACTION_FILES.flatMap((file) =>
            Array.from(readMigratedActionFile(file).matchAll(NAVIGATION_IMPORT)).map((match) => ({file, module: match[1] ?? ''})),
        );

        // Then the only ones left are the two modules that schedule work instead of changing a route
        const offenders = navigationImports.filter(({module}) => !ALLOWED_NAVIGATION_IMPORTS.has(module)).map(({file, module}) => `${file} imports ${module}`);
        expect(offenders).toEqual([]);
    });
});

export default PAYLOAD_RETURNING_ACTIONS;
