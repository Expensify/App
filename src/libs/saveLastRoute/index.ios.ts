import {updateLastRoute} from '@libs/actions/App';
import Navigation from '@libs/Navigation/Navigation';

export default function saveLastRoute() {
    updateLastRoute(Navigation.getActiveRoute());
}
