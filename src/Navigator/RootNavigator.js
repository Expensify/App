import _ from 'underscore';
import React from 'react';
import Onyx, {withOnyx} from 'react-native-onyx';
import {getPathFromState} from '@react-navigation/native';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import NavigationContainer from './NavigationContainer';
import ROUTES from '../ROUTES';
import linkingConfig from './linkingConfig';

const RootNavigator = props => (
    <NavigationContainer

        // This can be used by react-navigation to initialize the state. It's not a plain route but a bit more
        // complex and possibly not very useful.
        // eslint-disable-next-line react/jsx-props-no-multi-spaces
        initialRoute={props.currentRoute}
        onStateChange={(state) => {
            const path = getPathFromState(state, linkingConfig.config);
            if (path.includes(ROUTES.REPORT)) {
                const reportID = _.last(path.slice(1).split('/'));
                Onyx.merge(ONYXKEYS.CURRENTLY_VIEWED_REPORTID, reportID);

                // The report route is the only "main" route we have at the moment.
                Onyx.merge(ONYXKEYS.CURRENT_MAIN_ROUTE, path);
            }

            Onyx.merge(ONYXKEYS.CURRENT_ROUTE, path);
        }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
);

export default compose(
    withOnyx({
        currentRoute: {
            key: ONYXKEYS.CURRENT_ROUTE,
        },
        currentlyViewedReportID: {
            key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
        },
    }),
)(RootNavigator);
