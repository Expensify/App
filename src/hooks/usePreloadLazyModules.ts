function usePreloadLazyModules() {
    import(/* webpackPreload: true */ 'react-fast-pdf');
    import(/* webpackPreload: true */ 'react-pdf');
}

export default usePreloadLazyModules;
