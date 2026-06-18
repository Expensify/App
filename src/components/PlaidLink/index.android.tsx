import {useState} from 'react';
import {NativeModules} from 'react-native';

import type PlaidLinkProps from './types';

import BaseNativePlaidLink from './BaseNativePlaidLink';

const {AppStateTracker} = NativeModules;

function PlaidLink({onExit = () => {}, ...restProps}: PlaidLinkProps) {
    const [key, setKey] = useState(0);
    return (
        <BaseNativePlaidLink
            key={key}
            onExit={() => {
                AppStateTracker.getWasAppRelaunchedFromIcon().then((wasAppRelaunchedFromIcon) => {
                    if (wasAppRelaunchedFromIcon) {
                        setKey((prevKey) => prevKey + 1);
                        return;
                    }
                    onExit();
                });
            }}
            {...restProps}
        />
    );
}

export default PlaidLink;
