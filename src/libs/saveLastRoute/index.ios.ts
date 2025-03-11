import {updateLastRoute} from '@libs/actions/App';
import Navigation from '@navigation/Navigation';

export default function saveLastRoute() {
    updateLastRoute(Navigation.getActiveRoute());
}
