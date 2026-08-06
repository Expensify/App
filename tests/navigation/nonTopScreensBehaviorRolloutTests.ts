import fs from 'fs';
import {globSync} from 'glob';
import path from 'path';

const SOURCE_ROOT = path.join(__dirname, '..', '..', 'src');
const BEHAVIOR_PATTERN = /nonTopScreenBehavior:\s*'(?<behavior>\w+)'/g;

/**
 * Pins which screens deprioritize themselves with React <Activity> while they are covered. The option can be set on
 * a whole navigator or on a single screen, and every place listed here has been checked against the regressions that
 * hiding a screen can cause (a covered wide RHP that must stay painted, a persistent sidebar that must stay
 * interactive), so opting a new navigator or screen in is a deliberate step that belongs in this list too. The
 * rollout is read from the source instead of the modules themselves, because importing a navigator pulls in most of
 * the app.
 */
const EXPECTED_ROLLOUT: Array<[file: string, behavior: string]> = [
    ['libs/Navigation/AppNavigator/ModalStackNavigators/index.tsx', 'activity'],
    ['libs/Navigation/AppNavigator/createRightModalNavigator/index.tsx', 'activity'],
    ['libs/Navigation/AppNavigator/createSearchFullscreenNavigator/index.tsx', 'activity'],
    ['libs/Navigation/AppNavigator/createSplitNavigator/index.tsx', 'activity'],
    ['libs/Navigation/AppNavigator/createWorkspaceNavigator/index.tsx', 'activity'],
];

function readRollout(): Array<[file: string, behavior: string]> {
    const sourceFiles = globSync('**/*.{ts,tsx}', {cwd: SOURCE_ROOT, absolute: false});
    const rollout: Array<[file: string, behavior: string]> = [];

    for (const relativePath of sourceFiles.sort()) {
        const source = fs.readFileSync(path.join(SOURCE_ROOT, relativePath), 'utf8');
        for (const match of source.matchAll(BEHAVIOR_PATTERN)) {
            const behavior = match.groups?.behavior;
            if (behavior) {
                rollout.push([relativePath, behavior]);
            }
        }
    }

    return rollout;
}

describe('non-top screens behavior rollout', () => {
    // The scan reads every source file, so it runs once for all the checks below.
    const rollout = readRollout();

    it('covers exactly the navigators and screens that opted into deprioritizing their covered screens', () => {
        expect(rollout).toEqual(expect.arrayContaining(EXPECTED_ROLLOUT));
        expect(rollout).toHaveLength(EXPECTED_ROLLOUT.length);
    });

    it('leaves the root stack navigator alone, because hiding a root screen hides a whole navigator subtree', () => {
        expect(rollout.map(([file]) => file)).not.toContain('libs/Navigation/AppNavigator/createRootStackNavigator/index.tsx');
    });

    it('leaves no navigator on the react-freeze behavior', () => {
        expect(rollout.map(([, behavior]) => behavior)).not.toContain('freeze');
    });
});
