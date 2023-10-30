import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import lodashFindIndex from 'lodash/findIndex';
import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';
import {Freeze} from 'react-freeze';
import {InteractionManager} from 'react-native';

const propTypes = {
    /** Prop to disable freeze */
    keepVisible: PropTypes.bool,
    /** Children to wrap in FreezeWrapper. */
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    keepVisible: false,
};

function FreezeWrapper(props) {
    const [isScreenBlurred, setIsScreenBlurred] = useState(false);
    // we need to know the screen index to determine if the screen can be frozen
    const screenIndexRef = useRef(null);
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const currentRoute = useRoute();

    useEffect(() => {
        const index = lodashFindIndex(navigation.getState().routes, (route) => route.key === currentRoute.key);
        screenIndexRef.current = index;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('state', () => {
            // if the screen is more than 1 screen away from the current screen, freeze it,
            // we don't want to freeze the screen if it's the previous screen because the freeze placeholder
            // would be visible at the beginning of the back animation then
            if (navigation.getState().index - screenIndexRef.current > 1) {
                InteractionManager.runAfterInteractions(() => setIsScreenBlurred(true));
            } else {
                setIsScreenBlurred(false);
            }
        });
        return () => unsubscribe();
    }, [isFocused, isScreenBlurred, navigation]);

    return <Freeze freeze={!isFocused && isScreenBlurred && !props.keepVisible}>{props.children}</Freeze>;
}

FreezeWrapper.propTypes = propTypes;
FreezeWrapper.defaultProps = defaultProps;
FreezeWrapper.displayName = 'FreezeWrapper';

export default FreezeWrapper;
