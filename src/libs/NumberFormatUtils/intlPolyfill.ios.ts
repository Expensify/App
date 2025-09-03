import intlPolyfill from '@libs/IntlPolyfill';

// On iOS, polyfills from `additionalSetup` are applied after memoization, which results in incorrect cache entry of `Intl.NumberFormat` (e.g. lacking `formatToParts` method).
// To fix this, we need to apply the polyfill manually before memoization.
// For further information, see: https://github.com/Expensify/App/pull/43868#issuecomment-2217637217
const initPolyfill = () => {
    intlPolyfill();
};

export default initPolyfill;
