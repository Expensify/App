/** Keeps the service worker's path classes in sync with New Expensify's routes and away from Expensify Classic's pages. */
import createNormalizedConfigs from '@libs/Navigation/helpers/createNormalizedConfigs';
import findFocusedRouteWithOnyxTabGuard from '@libs/Navigation/helpers/findFocusedRouteWithOnyxTabGuard';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import {config} from '@libs/Navigation/linkingConfig/config';
import oldRoutes from '@libs/Navigation/linkingConfig/OldRoutes';
import {APP_ONLY_NAVIGATION_PATHS, SHARED_NAVIGATION_PATHS, SIGN_OUT_NAVIGATION_PATHS} from '@libs/NavigationPaths';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type PathClass = 'appOnly' | 'shared' | 'none';

const EXAMPLE_PARAM = '123';
const SHARED_EXAMPLES = ['/', '/inbox', '/home', '/settings', '/travel', '/statements/202501', '/v/1/abc', '/u/1/abc'];

// Routes New Expensify parses that the service worker deliberately leaves to the network
const UNCLASSIFIED_ROUTES = new Set([
    // The experience router always sends /concierge to Expensify Classic
    'concierge',
    // Tab screens whose exact paths only exist inside their parent route
    CONST.TAB.RECEIPT_PARTNERS.ALL,
    CONST.TAB.RECEIPT_PARTNERS.LINKED,
    CONST.TAB.RECEIPT_PARTNERS.OUTSTANDING,
]);

// Pages Expensify Classic serves at the root of its host: every top-level PHP file, which nginx serves without the extension, and every directory
// cspell:disable
const CLASSIC_PAGES = [
    ...['accessibility', 'accountants', 'achAuthentication', 'achterms', 'activate', 'addcreditcard', 'admin', 'admin_companycards', 'admin_domains'],
    ...['admin_groups', 'admin_members', 'admin_policies', 'admin_reconciliation', 'analytics', 'api', 'apiCommandTypes', 'approve'],
    ...['bancorp-bank-wallet-terms-of-service', 'beta', 'browserupgrade', 'card', 'case', 'chart', 'chat', 'commercialcardagreement'],
    ...['commercialcardprogramterms', 'confirm2', 'connections', 'csvExport', 'csvtojson', 'customers', 'dashboard', 'disable-reminders'],
    ...['domain_admins', 'domain_companycards', 'domain_groups', 'domain_loadingDock', 'domain_members', 'domain_saml', 'domain_travelBilling'],
    ...['domain_travelInvoicing', 'domain_travelreport', 'easy-money', 'ecardstatement', 'eeacardagreement', 'emailReportAction', 'esignagreement'],
    ...['expenses', 'expensify-payments-wallet-terms-of-service', 'fees', 'help', 'help-search', 'home', 'iframe_addExpensifyCardDetails', 'inbox'],
    ...['index', 'installmobileapp', 'integrateGusto', 'integrateZenefits', 'integrationServerProxy', 'intuit_subscription', 'invoice', 'invoices'],
    ...['invoicing', 'join', 'jsontocsv', 'jsontoxls', 'jsontoxlsx', 'karmaprogramterms', 'mobile', 'newbankform', 'newdotreport', 'npsSurvey', 'old'],
    ...['onsignin', 'onsignup', 'partnerSignin', 'paymentsentities', 'payrollterms', 'pdfmap3', 'pdfreport', 'ping', 'plans', 'policy', 'press'],
    ...['price', 'pricing', 'printablemileage3', 'printablereport', 'printabletravelreport', 'privacy', 'receipt2', 'receipts', 'redirectToSpotnana'],
    ...['report', 'reports', 'resetpassword', 'secure', 'setLocalValidateCode', 'settings', 'setup', 'signin', 'signout', 'signup', 'smartreports'],
    ...['statement', 'terms', 'tplprivacy', 'tpmlprivacy', 'travel', 'TravelBillingStatement', 'travelterms', 'trips', 'twt', 'ukcardagreement'],
    ...['ukeeacommercialcardprogramterms', 'uklaunch', 'unlimited', 'unlink-email', 'unsubscribe', 'upgrade', 'UrbanAirshipAPITest', 'user'],
    ...['validate-email', 'verifyReceipt', 'wifiRedirect', 'wifiSuccess', 'www-dev-config', 'xero', 'xlstojson'],
    ...['apiassets', 'authentication', 'build', 'cdn', 'concierge', 'errors', 'expensiworks', 'font', 'homepage', 'js', 'm', 'mcp', 'newjs'],
    ...['newtemplates', 'notifications', 'oauth', 'openID', 'pages', 'partners', 'site', 'statements', 'v', 'u'],
];
// cspell:enable

function classify(pathAndSearch: string): PathClass {
    const isAppOnly = APP_ONLY_NAVIGATION_PATHS.some((pattern) => pattern.test(pathAndSearch));
    const isShared = SHARED_NAVIGATION_PATHS.some((pattern) => pattern.test(pathAndSearch));
    if (isAppOnly && isShared) {
        throw new Error(`${pathAndSearch} matches both app-only and shared paths`);
    }
    if (isAppOnly) {
        return 'appOnly';
    }
    return isShared ? 'shared' : 'none';
}

/** Expands a route pattern into example URLs, covering each optional parameter with and without a value and every money request action. */
function getExampleURLs(pattern: string): string[] {
    return pattern
        .split('/')
        .filter(Boolean)
        .reduce<string[][]>(
            (paths, segment, index) => {
                let values: Array<string | undefined> = [segment];
                if (segment === '*') {
                    values = [index === 0 ? CONST.IOU.ACTION.CREATE : EXAMPLE_PARAM];
                }
                if (segment.startsWith(':')) {
                    values = index === 0 && segment === ':action' ? Object.values(CONST.IOU.ACTION) : [EXAMPLE_PARAM];
                }
                if (segment.endsWith('?')) {
                    values = [EXAMPLE_PARAM, undefined];
                }
                return paths.flatMap((path) => values.map((value) => (value === undefined ? path : [...path, value])));
            },
            [[]],
        )
        .map((segments) => `/${segments.join('/')}`);
}

const dynamicRoutes = Object.values(DYNAMIC_ROUTES);
const rootDynamicSuffixes: string[] = dynamicRoutes.filter(({entryScreens}) => (entryScreens as readonly string[]).includes('*')).map(({path}) => path);
const nestedDynamicSuffixes: string[] = dynamicRoutes.filter(({entryScreens}) => !(entryScreens as readonly string[]).includes('*')).map(({path}) => path);

// Paths of dynamic routes that need a parent screen only exist appended to that screen, so they are not entry URLs
function isNestedDynamicSuffix(pattern: string): boolean {
    return nestedDynamicSuffixes.some((suffix) => pattern === suffix || pattern.startsWith(`${suffix}/`));
}

const routePatterns = Object.keys(config?.screens ?? {})
    .flatMap((screen) => createNormalizedConfigs(screen, (config?.screens ?? {}) as Parameters<typeof createNormalizedConfigs>[1], [], [], []))
    .map(({pattern}) => pattern)
    .filter((pattern) => pattern !== '*' && !UNCLASSIFIED_ROUTES.has(pattern) && !isNestedDynamicSuffix(pattern) && !rootDynamicSuffixes.includes(pattern));

describe('NavigationPaths', () => {
    it.each([
        '/',
        '/?utm_source=x',
        '/inbox',
        '/inbox/',
        '/inbox?authToken=t&email=e',
        '/settings',
        '/settings/',
        '/settings/?x=1',
        '/home',
        '/travel',
        '/statements/202501',
        '/v/1/abc',
        '/u/1/abc/',
    ])("treats '%s' as a path both products serve", (path) => {
        // Given a path that opens New Expensify or Expensify Classic depending on the user's experience cookie
        // When the service worker classifies it
        const pathClass = classify(path);

        // Then it goes to the network first, so the router can pick the product, and the saved app is only a fallback offline
        expect(pathClass).toBe('shared');
    });

    it.each([
        '/r/123',
        '/settings/profile',
        '/transition?x=1',
        '/index.html',
        '/index.html?appUpdateRequired=true',
        '/Home',
        '/home/verify-account',
        '/inbox/keyboard-shortcuts',
        '/travel/upgrade/workspace/confirmation',
        '/statements/202501/keyboard-shortcuts',
        '/v/1/abc/keyboard-shortcuts',
        '/policy/1/copy-settings',
        '/reports/reject/1',
        '/flag/1/2',
        '/merge/1',
        '/referral/x',
        '/home-page',
        '/a/1/avatar',
        '/avatar/1',
        '/task-details',
        '/keyboard-shortcuts',
        '/two-factor-auth/verify',
        '/add-payment-card',
        '/auto-submit',
    ])("treats '%s' as a New Expensify path", (path) => {
        // Given a path only New Expensify serves
        // When the service worker classifies it
        const pathClass = classify(path);

        // Then the saved app opens it right away, also offline, because no Classic page can be behind it
        expect(pathClass).toBe('appOnly');
    });

    it.each(['/reports', '/signin', '/terms', '/policy?param=1', '/index', '/index?x=1', '/concierge', '/concierge/', '/statements', '/Inbox', '/SETTINGS', '/api/OpenApp'])(
        "leaves '%s' to the browser",
        (path) => {
            // Given a path served by Expensify Classic or the backend, or a different spelling of a New Expensify path
            // When the service worker classifies it
            const pathClass = classify(path);

            // Then the worker doesn't handle it, so the request reaches the server exactly as without a worker
            expect(pathClass).toBe('none');
        },
    );

    it.each(CLASSIC_PAGES)("never opens New Expensify for the Expensify Classic page '/%s'", (page) => {
        // Given an Expensify Classic page, with and without a query and a trailing slash
        // When the service worker classifies it
        const pathClasses = [`/${page}`, `/${page}?x=1`, `/${page}/`].map(classify);

        // Then none is app-only, because an app-only Classic page would be unreachable for every user with the worker
        expect(pathClasses).not.toContain('appOnly');
    });

    it.each(['/signout', '/signout/', '/signout?clean=true', '/signout?resetSession=true', '/signout?shouldStartSignIn=1&email=a', '/signout.php', '/signout.php?clean=true'])(
        "recognizes '%s' as signing out of Expensify Classic",
        (path) => {
            // Given a navigation that signs out of Expensify Classic
            // When the service worker checks it
            const isSignOut = SIGN_OUT_NAVIGATION_PATHS.some((pattern) => pattern.test(path));

            // Then it is recognized, so the previous user's saved media is cleared
            expect(isSignOut).toBe(true);
        },
    );

    it.each([
        '/authentication/saml/logoutCallback',
        '/authentication/saml/logoutCallback?domain=a.com',
        '/authentication/saml/logoutCallback.php',
        '/authentication/saml/logoutCallback.php?x=1',
    ])("recognizes the SAML sign-out callback '%s'", (path) => {
        // Given the callback a SAML provider opens after signing the user out, with or without the file extension
        // When the service worker checks it
        const isSignOut = SIGN_OUT_NAVIGATION_PATHS.some((pattern) => pattern.test(path));

        // Then it counts as signing out, like Classic's own sign-out page
        expect(isSignOut).toBe(true);
    });

    // cspell:disable-next-line
    it.each(['/signouts', '/signout-x', '/signout.phpx', '/signin', '/authentication/saml/logoutCallbackx'])("does not treat '%s' as signing out", (path) => {
        // Given a path that only resembles a sign-out page
        // When the service worker checks it
        const isSignOut = SIGN_OUT_NAVIGATION_PATHS.some((pattern) => pattern.test(path));

        // Then it doesn't count, so saved media isn't cleared for an unrelated page
        expect(isSignOut).toBe(false);
    });

    it('classifies every New Expensify route', () => {
        // Given every path New Expensify parses, with example parameter values
        const urls = routePatterns.flatMap(getExampleURLs);

        // When each one is classified
        const unclassified = urls.filter((url) => classify(url) === 'none');

        // Then each one opens New Expensify offline. A new route needs an app-only pattern, or it only works online.
        expect(unclassified).toEqual([]);
    });

    it('classifies every old route New Expensify redirects', () => {
        // Given every old path New Expensify still redirects, with example parameter values
        const urls = Object.keys(oldRoutes).flatMap(getExampleURLs);

        // When each one is classified
        const unclassified = urls.filter((url) => classify(url) === 'none');

        // Then old links saved by users keep opening New Expensify offline
        expect(unclassified).toEqual([]);
    });

    it.each(rootDynamicSuffixes.flatMap(getExampleURLs))("opens New Expensify for the dynamic route '%s' at the root and under every shared path", (suffixURL) => {
        // Given a dynamic route that New Expensify opens on top of any screen
        const urls = SHARED_EXAMPLES.map((sharedPath) => `${sharedPath === '/' ? '' : sharedPath}${suffixURL}`);

        // When it is classified after the root and after every shared path
        const urlsOutsideApp = urls.filter((url) => classify(url) !== 'appOnly');

        // Then it is app-only wherever it is appended, and New Expensify renders it at the root
        expect(urlsOutsideApp).toEqual([]);
        expect(findFocusedRouteWithOnyxTabGuard(getStateFromPath(suffixURL))?.name).not.toBe(SCREENS.NOT_FOUND);
    });

    it.each(['/r', '/e', '/a', '/new', '/domain', '/pay', '/setting', '/travel', '/home'])("ends '%s' at a segment boundary", (prefix) => {
        // Given paths that extend a New Expensify first segment, as some Classic page names do
        // When they are classified
        const pathClasses = [`${prefix}x`, `${prefix}_x`].map(classify);

        // Then they aren't app-only, because a pattern matches whole segments only
        expect(pathClasses).not.toContain('appOnly');
    });
});
