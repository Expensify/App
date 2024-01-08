import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import WaypointEditor from './WaypointEditor';

type MoneyRequestEditWaypointPageProps = StackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.EDIT_WAYPOINT>;

function MoneyRequestEditWaypointPage({route}: MoneyRequestEditWaypointPageProps) {
    return <WaypointEditor route={route} />;
}

MoneyRequestEditWaypointPage.displayName = 'MoneyRequestEditWaypointPage';

export default MoneyRequestEditWaypointPage;
