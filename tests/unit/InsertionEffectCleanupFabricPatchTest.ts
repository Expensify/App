import fs from 'fs';
import path from 'path';

// useScreenActivityEffect releases a component removed inside a hidden <Activity> from its useInsertionEffect cleanup,
// which Fabric runs only with the react-native patch run-insertion-effect-cleanup-in-hidden-subtree (044). The canary
// InsertionEffectCleanupInHiddenActivityTest renders through react-test-renderer, so this test reads the Fabric bundles
// themselves: without the patch every setup of a hidden removal would leak on native with every other test green.

const RENDERER_DIRECTORY = path.join(path.dirname(require.resolve('react-native/package.json')), 'Libraries', 'Renderer', 'implementations');

const RENDERERS = ['ReactFabric-dev.js', 'ReactFabric-prod.js', 'ReactFabric-profiling.js'];

/** The insertion cleanup of a deleted component, which the dev build names Insertion and the other builds inline as 2. */
const INSERTION_CLEANUP_ON_DELETION = /commitHookEffectListUnmount\(\s*(?:Insertion|2),\s*deletedFiber,\s*nearestMountedAncestor\s*\)/;

/** The guard the patch removes, which skips that cleanup when the deleted component sits in a hidden subtree. */
const HIDDEN_SUBTREE_GATE = /offscreenSubtreeWasHidden \|\|\s*commitHookEffectListUnmount\(\s*(?:Insertion|2),/;

describe.each(RENDERERS)('react-native patch 044 in %s', (renderer) => {
    const source = fs.readFileSync(path.join(RENDERER_DIRECTORY, renderer), 'utf8');

    it('runs the insertion cleanup of a deleted component without the hidden-subtree gate', () => {
        expect(source).toMatch(INSERTION_CLEANUP_ON_DELETION);
        expect(source).not.toMatch(HIDDEN_SUBTREE_GATE);
    });
});
