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
});
