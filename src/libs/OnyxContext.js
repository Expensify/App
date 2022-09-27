/* eslint-disable react/prop-types */
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import React, {useState, useEffect} from 'react';
import {Provider, useSetState} from './onyxContextStore';

function isCollectionKey(key) {
    const keyParts = key.split('_');
    return keyParts.length === 2 && keyParts[1] === '';
}

/**
 * @param {Object} object
 * @returns {Object}
 */
function flattenOnyxKeys(object) {
    return _.reduce(object, (prev, value) => {
        if (_.isObject(value)) {
            return [...prev, ...flattenOnyxKeys(value)];
        }

        prev.push(value);
        return prev;
    }, []);
}

const OnyxStateUpdater = (props) => {
    const setState = useSetState();

    // Set up Onyx subscriptions here once and update the state on change
    useEffect(() => {
        let keysConnected = 0;
        const keys = flattenOnyxKeys(props.onyxKeys);

        keys.forEach((key) => {
            if (isCollectionKey(key)) {
                Onyx.connect({
                    key,
                    callback: (val, memberKey) => {
                        setState(prev => ({
                            ...prev,
                            [key]: {
                                ...prev[key],
                                [memberKey]: val,
                            },
                        }));
                        keysConnected++;
                        if (keysConnected === keys.length) {
                            props.onAllKeysLoaded();
                        }
                    },
                });
                return;
            }

            Onyx.connect({
                key,
                callback: (val) => {
                    setState(prev => ({
                        ...prev,
                        [key]: val,
                    }));
                    keysConnected++;
                    if (keysConnected === keys.length) {
                        props.onAllKeysLoaded();
                    }
                },
            });
        });
    }, []);

    return null;
};

const OnyxStateProvider = (props) => {
    const [isInitialDataReady, setIsInitialDataReady] = useState(false);
    return (
        <Provider>
            <OnyxStateUpdater onyxKeys={props.onyxKeys} onAllKeysLoaded={() => setIsInitialDataReady(true)} />
            {isInitialDataReady && props.children}
        </Provider>
    );
};

export default OnyxStateProvider;
