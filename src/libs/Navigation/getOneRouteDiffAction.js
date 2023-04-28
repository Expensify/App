import _ from 'lodash';
import {CommonActions} from '@react-navigation/native';

const getFocusedState = (state) => {
    const routes = state.routes;
    if (routes[routes.length - 1].state === undefined) {
        return state;
    }
    return getFocusedState(routes[routes.length - 1].state);
};

const getOneRouteDiffAction = (currentState, targetState) => {
    const aRoutes = getFocusedState(currentState).routes;
    const bRoutes = getFocusedState(targetState).routes;

    console.log('aRoutes', aRoutes);
    console.log('bRoutes', bRoutes);

    if (!aRoutes || !bRoutes || Math.abs(aRoutes.length - bRoutes.length) !== 1) {
        return undefined;
    }

    if (aRoutes.length > bRoutes.length) { 
        return undefined;
    }

    const [longerRoutes, shorterRoutes] = aRoutes.length > bRoutes.length ? [aRoutes, bRoutes] : [bRoutes, aRoutes];

    const diff = _.differenceBy(longerRoutes.slice(0, -1), shorterRoutes, 'name');

    if (diff.length > 0) {
        return undefined;
    }
    return CommonActions.navigate({..._.last(longerRoutes)});
};

export default getOneRouteDiffAction;
