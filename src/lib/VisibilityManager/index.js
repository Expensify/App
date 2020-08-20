/**
 * This is a higher-order component which determines when the app should be refreshed, and either:
 *  - Refreshes the page if it's currently hidden
 *  OR
 *  - Prompts the user to refresh the page if it's currently visible
 */
import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';

import CONST from './CONST';
import {request} from '../Network';

const getDisplayName = component => component.displayName || component.name || 'Component';

export default function (WrappedComponent) {
    class withBackgroundRefresh extends React.Component {
        constructor() {
            super();
            this.timer = null;
            this.onVisibilityChange = this.onVisibilityChange.bind(this);
        }

        componentDidMount() {
            window.addEventListener(CONST.EVENT.VISIBILITY_CHANGE, () => {
                clearInterval(this.timer);
                setInterval(this.onVisibilityChange, CONST.REFRESH_TIMEOUT);
                this.onVisibilityChange();
            });

            // When the page first loads, get the current version hash
            this.getStoredVersionAsync();

            // Trigger onVisibilityChange every 30 min
            this.timer = window.setInterval(this.onVisibilityChange, CONST.REFRESH_TIMEOUT);
        }

        /**
         * Check if the app should be refreshed.
         * If yes and the window is hidden, refresh it immediately.
         * If yes and the window is visible, prompt the user to refresh the page.
         * If no, do nothing.
         */
        async onVisibilityChange() {
            const pageShouldRefresh = await this.pageShouldRefreshAsync();
            if (pageShouldRefresh) {
                if (document.visibilityState === CONST.STATE.HIDDEN) {
                    // Refresh page w/o browser cache
                    window.location.reload(true);
                } else if (document.visibilityState === CONST.STATE.VISIBLE) {
                    // TODO: Notify user in a less invasive way that they should refresh the page (i.e: Growl)
                    if (window.confirm('Refresh the page to get the latest updates!')) {
                        window.location.reload(true);
                    }
                }
            }
        }

        /**
         * Get stored git hash, or if there is none then fetch the remote git hash and save it to LocalStorage.
         */
        async getStoredVersionAsync() {
            const storedVersion = await AsyncStorage.getItem(CONST.KEY_VERSION_HASH);
            if (!storedVersion) {
                // only get the remote version if there is no version locally stored
                const remoteVersion = await request(CONST.COMMAND.GET_VERSION_HASH);
                AsyncStorage.setItem(CONST.KEY_VERSION_HASH, remoteVersion);
            }
        }

        /**
         * Fetch the remote git hash, and compare it to the one stored in LocalStorage.
         *
         * If they are the same:
         *  - save the updated version in LocalStorage
         *  - return false
         *
         * Else return true
         *
         * @returns {boolean}
         */
        async pageShouldRefreshAsync() {
            const storedVersion = await AsyncStorage.getItem(CONST.KEY_VERSION_HASH);

            // If the app is offline, this request will hang indefinitely.
            // But that's okay, because it couldn't possibly refresh anyways.
            const remoteVersion = await request(CONST.COMMAND.GET_VERSION_HASH);

            if (storedVersion === remoteVersion) {
                if (!storedVersion) {
                    await AsyncStorage.setItem(CONST.KEY_VERSION_HASH, remoteVersion);
                }
                return false;
            }

            return true;
        }

        render() {
            return <WrappedComponent />;
        }
    }

    withBackgroundRefresh.displayName = getDisplayName(WrappedComponent);
    return withBackgroundRefresh;
}
