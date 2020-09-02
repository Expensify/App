/**
 * This is a higher-order component which determines when the app should be refreshed, and either:
 *  - Refreshes the page if it's currently hidden
 *  OR
 *  - Prompts the user to refresh the page if it's currently visible
 */
import React from 'react';
import PropTypes from 'prop-types';

import InitRefresher from '../../lib/actions/WebRefresh';
import IONKEYS from '../../IONKEYS';
import withIon from '../withIon';

const getDisplayName = component => component.displayName || component.name || 'Component';

export default function (WrappedComponent) {
    const propTypes = {
        appShouldRefresh: PropTypes.boolean.isRequired,
    };

    class withRefresher extends React.Component {
        componentDidMount() {
            InitRefresher();
        }

        refreshIfNeeded() {
            if (this.props.appShouldRefresh) {
                if (document.visibilityState === 'hidden') {
                    // Page is hidden, refresh immediately
                    window.location.reload(true);
                } else if (document.visibilityState === 'visible') {
                    // TODO: Notify user in a less invasive way that they should refresh the page (i.e: Growl)
                    // Prompt user to refresh the page
                    if (window.confirm('Refresh the page to get the latest updates!')) {
                        window.location.reload(true);
                    }
                }
            }
        }

        render() {
            this.refreshIfNeeded();
            return <WrappedComponent />;
        }
    }

    withRefresher.propTypes = propTypes;
    withRefresher.displayName = getDisplayName(WrappedComponent);

    return withIon({
        appShouldRefresh: {
            key: IONKEYS.APP.SHOULD_REFRESH,
        },
    })(withRefresher);
}
