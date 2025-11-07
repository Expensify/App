function usePreloadLazyModules() {
    import(/* webpackPreload: true */ 'react-fast-pdf');
}

export default usePreloadLazyModules;
