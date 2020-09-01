/**
 * This is a higher-order component which determines when the app should be refreshed, and either:
 *  - Refreshes the page if it's currently hidden
 *  OR
 *  - Prompts the user to refresh the page if it's currently visible
 */
import React from 'react';

import InitRefresher from '../../lib/actions/WebRefresh';
import IONKEYS from '../../IONKEYS';
import withIon from '../withIon';

const STATE_HIDDEN = 'hidden';
const STATE_VISIBLE = 'visible';

const getDisplayName = component => component.displayName || component.name || 'Component';

export default function (WrappedComponent) {
    class withBackgroundRefresh extends React.Component {
        constructor() {
            super();

            this.state = {
                appShouldRefresh: false,
            };
        }

        componentDidMount() {
            InitRefresher();
        }

        render() {
            if (this.state.appShouldRefresh) {
                if (document.visibilityState === STATE_HIDDEN) {
                    // Page is hidden, refresh immediately
                    window.location.reload(true);
                } else if (document.visibilityState === STATE_VISIBLE) {
                    // TODO: Notify user in a less invasive way that they should refresh the page (i.e: Growl)
                    // Prompt user to refresh the page
                    if (window.confirm('Refresh the page to get the latest updates!')) {
                        window.location.reload(true);
                    }
                }
            }
            return <WrappedComponent />;
        }
    }

    withBackgroundRefresh.displayName = getDisplayName(WrappedComponent);
    return withIon({
        appShouldRefresh: {
            key: IONKEYS.APP.SHOULD_REFRESH,
        },
    })(withBackgroundRefresh);
}
