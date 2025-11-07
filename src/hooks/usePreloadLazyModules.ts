// This hook makes it possible to manually load the lazy loaded modules
// right after the main bundle is loaded to decrease the bundle size
function usePreloadLazyModules() {
    import(/* webpackPreload: true */ 'react-fast-pdf');
    import(/* webpackPreload: true */ 'react-pdf');
}

export default usePreloadLazyModules;
