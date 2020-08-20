/**
 * This is a higher-order component which determines when the app should be refreshed, and either:
 *  - Refreshes the page if it's currently hidden
 *  OR
 *  - Prompts the user to refresh the page if it's currently visible
 */
import React from 'react';
import CONST from './CONST';

const getDisplayName = component => component.displayName || component.name || 'Component';

export default function (WrappedComponent) {
    class withBackgroundRefresh extends React.Component {
        constructor() {
            super();
            this.state = {
                pageShouldRefresh: false,
            };

            this.onVisibilityChange.bind(this);
        }

        componentDidMount() {
            window.addEventListener(CONST.EVENT.VISIBILITY_CHANGE, this.onVisibilityChange());
        }

        onVisibilityChange() {
            if (this.state.pageShouldRefresh) {
                if (document.visibilityState === CONST.STATE.HIDDEN) {
                    // Refresh page w/o browser cache
                    window.location.reload(true);
                } else if (document.visibilityState === CONST.STATE.VISIBLE) {
                    // Notify user that they should refresh the page
                }
            }
        }

        render() {
            return <WrappedComponent />;
        }
    }

    withBackgroundRefresh.displayName = getDisplayName(WrappedComponent);
    return withBackgroundRefresh;
}
