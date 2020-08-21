/**
 * This is a higher-order component which determines when the app should be refreshed, and either:
 *  - Refreshes the page if it's currently hidden
 *  OR
 *  - Prompts the user to refresh the page if it's currently visible
 */
import React from 'react';

import InitRefresher from '../../lib/actions/WebRefresh';
import IONKEYS from '../../IONKEYS';
import withIon from '../../components/WithIon';

const getDisplayName = component => component.displayName || component.name || 'Component';

export default function (WrappedComponent) {
    class withBackgroundRefresh extends React.Component {
        constructor() {
            super();

            this.state = {
                appShouldRefresh: false,
            };

            this.onVisibilityChange = this.onVisibilityChange.bind(this);
        }

        componentDidMount() {
            InitRefresher();
        }

        render() {
            if (this.state.appShouldRefresh) {
                window.location.reload(true);
            }
            return <WrappedComponent />;
        }
    }

    withBackgroundRefresh.displayName = getDisplayName(WrappedComponent);
    return withIon({
        appShouldRefresh: {
            key: IONKEYS,
        },
    })(withBackgroundRefresh);
}
