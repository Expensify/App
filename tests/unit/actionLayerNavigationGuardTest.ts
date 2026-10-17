import fs from 'fs';
import path from 'path';

/**
 * Architecture guard for issue #84631: navigation belongs in the view layer, not in `src/libs/actions/`.
 * `submitWithDismissFirst` is the view-layer dismiss-first orchestrator; no action file may import it.
 */
const ACTIONS_DIR = path.join(__dirname, '..', '..', 'src', 'libs', 'actions');
const FORBIDDEN_IMPORT = '@libs/Navigation/helpers/submitWithDismissFirst';

/** Action files whose navigation already moved to the view layer. Each is pinned here as it migrates, so it cannot drift back before the ESLint ban lands. */
const MIGRATED_ACTION_FILES = ['IOU/Split.ts', 'IOU/SplitTransactionUpdate.ts', 'IOU/PerDiem.ts', 'IOU/SendInvoice.ts', 'IOU/TrackExpense.ts'];

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
