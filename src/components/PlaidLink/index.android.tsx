import {useState} from 'react';
import {NativeModules} from 'react-native';
import BaseNativePlaidLink from './BaseNativePlaidLink';
import type PlaidLinkProps from './types';

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
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
        />
    );
}

export default PlaidLink;
