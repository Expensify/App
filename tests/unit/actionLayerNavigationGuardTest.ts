import fs from 'fs';
import path from 'path';

/**
 * Architecture guard for issue #84631: navigation belongs in the view layer, not in `src/libs/actions/`.
 * `submitWithDismissFirst` is the view-layer dismiss-first orchestrator; no action file may import it.
 * (PR 9 will additionally enforce this via an ESLint `no-restricted-imports` rule once the legacy
 * `NavigationHelpers.ts` value-imports of the other view helpers are removed.)
 */
const ACTIONS_DIR = path.join(__dirname, '..', '..', 'src', 'libs', 'actions');
const FORBIDDEN_IMPORT = '@libs/Navigation/helpers/submitWithDismissFirst';

/** Action files whose navigation already moved to the view layer. Each is pinned here as it migrates, so it cannot drift back before the ESLint ban lands. */
const MIGRATED_ACTION_FILES = ['IOU/Split.ts', 'IOU/SplitTransactionUpdate.ts', 'IOU/PerDiem.ts', 'IOU/SendInvoice.ts', 'IOU/TrackExpense.ts'];
const ROUTE_CHANGING_CALL = /Navigation\.(navigate|goBack|dismissModal\w*|dismissTo\w+|removeScreenByKey|navigateBack\w*|revealRoute\w*)\(/;

function collectSourceFiles(dir: string): string[] {
    return fs.readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            return collectSourceFiles(fullPath);
        }
        return entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') ? [fullPath] : [];
    });
}

describe('action-layer navigation guard (#84631)', () => {
    it('no file under src/libs/actions imports the view-layer submitWithDismissFirst orchestrator', () => {
        const offenders = collectSourceFiles(ACTIONS_DIR)
            .filter((file) => fs.readFileSync(file, 'utf8').includes(FORBIDDEN_IMPORT))
            .map((file) => path.relative(ACTIONS_DIR, file));

        expect(offenders).toEqual([]);
    });

    it('action files that already moved their navigation make no route-changing Navigation calls', () => {
        // Given the action files whose navigation has moved to the view layer
        // When each is scanned for a route-changing Navigation call
        const offenders = MIGRATED_ACTION_FILES.filter((file) => ROUTE_CHANGING_CALL.test(fs.readFileSync(path.join(ACTIONS_DIR, file), 'utf8')));

        // Then none of them navigates, dismisses or pops a screen
        expect(offenders).toEqual([]);
    });
});
