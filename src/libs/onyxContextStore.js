import {createContainer} from 'react-tracked';
import {useState} from 'react';

const useValue = () => useState({});

const {
    Provider,
    useTrackedState,
    useUpdate: useSetState,
} = createContainer(useValue);

export {
    Provider, useTrackedState, useSetState,
};
