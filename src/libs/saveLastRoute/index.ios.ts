import Navigation from '@libs/Navigation/Navigation';

// Dynamic Import to avoid circular dependency
const AppActions = () => import('@libs/actions/App');

export default function saveLastRoute() {
    AppActions().then(({updateLastRoute}) => {
        updateLastRoute(Navigation.getActiveRoute());
    });
}
