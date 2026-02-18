/**
 * Performance tests with Reassure can require big timeouts as all runs
 * for a test have to be executed within this limit. (default runs=10)
 * This also includes manual garbage collection between them.
 */
import '../../src/polyfills/PromiseWithResolvers';

jest.setTimeout(240000); // 4 minutes
