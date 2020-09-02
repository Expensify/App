/**
 * This is a higher-order component which determines when the app should be refreshed, and either:
 *  - Refreshes the page if it's currently hidden
 *  OR
 *  - Prompts the user to refresh the page if it's currently visible
 */
import React from 'react';
import PropTypes from 'prop-types';

import getDisplayName from '../../lib/getDisplayName';
import InitRefresher from '../../lib/actions/WebRefresh';
import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';
import withIon from '../withIon';

export default function (WrappedComponent) {
    const propTypes = {
        appShouldRefresh: PropTypes.boolean.isRequired,
    };

    class withRefresher extends React.Component {
        componentDidMount() {
            InitRefresher();
        }

        componentDidUpdate(prevProps) {
            if (!prevProps.appShouldRefresh && this.props.appShouldRefresh) {
                if (document.visibilityState === 'hidden') {
                    // Page is hidden, refresh immediately
                    this.refreshIfOnline();
                } else if (document.visibilityState === 'visible') {
                    // TODO: Notify user in a less invasive way that they should refresh the page (i.e: Growl)
                    // Prompt user to refresh the page
                    if (window.confirm('Refresh the page to get the latest updates!')) {
                        this.refreshIfOnline();
                    } else {
                        this.props.appShouldRefresh = false;
                    }
                }
            }
        }

        refreshIfOnline() {
            Ion.get(IONKEYS.NETWORK, 'isOffline')
                .then((isOffline) => {
                    if (!isOffline) {
                        window.location.reload(true);
                    } else {
                        this.props.appShouldRefresh = false;
                    }
                });
        }

        render() {
            return <WrappedComponent />;
        }
    }

    withRefresher.propTypes = propTypes;
    withRefresher.displayName = `withRefresher(${getDisplayName(WrappedComponent)})`;

    return withIon({
        appShouldRefresh: {
            key: IONKEYS.APP.SHOULD_REFRESH,
        },
    })(withRefresher);
}
