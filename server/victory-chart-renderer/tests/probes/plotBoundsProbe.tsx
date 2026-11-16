/*
 * Runs as a bundled child process rather than inside the test process, because victory-native resolves
 * react-native, which only loads through the stubs rnStubPlugin substitutes at bundle time.
 */
import initSkiaForCli from '../../src/initSkiaForCli';

// Skia must be initialized before the chart module and its transitive imports are evaluated.
await initSkiaForCli();
await import('./plotBoundsProbeMain');
