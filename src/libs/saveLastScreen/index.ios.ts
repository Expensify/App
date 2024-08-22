import {updateLastScreen} from '@libs/actions/App';
import Navigation from '@libs/Navigation/Navigation';

export default function saveLastScreen() {
    updateLastScreen(Navigation.getActiveRoute());
}
