import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {Freeze} from 'react-freeze';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';

const propTypes = {
    ...windowDimensionsPropTypes,
    keepVisible: PropTypes.bool,
};

const defaultProps = {
    keepVisible: false,
};

function FreezeWrapper(props) {
    const [isScreenBlurred, setIsScreenBlurred] = useState(false);
    // we need to know the screen index to determine if the screen can be frozen
    const [screenIndex, setScreenIndex] = useState(null);
    const isFocused = useIsFocused();
    const navigation = useNavigation();

    useEffect(() => {
        if (screenIndex !== null) {
            return;
        }
        setScreenIndex(navigation.getState().index);
    }, [navigation, screenIndex]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('state', () => {
            // if the screen is more than 1 screen away from the current screen, freeze it,
            // we don't want to freeze the screen if it's the previous screen because the freeze placeholder
            // would be visible at the beginning of the back animation then
            if (navigation.getState().index - screenIndex > 1) {
                setIsScreenBlurred(true);
            } else {
                setIsScreenBlurred(false);
            }
        });
        return () => unsubscribe();
    }, [isFocused, isScreenBlurred, navigation, screenIndex]);

    return <Freeze freeze={!isFocused && isScreenBlurred && !props.keepVisible}>{props.children}</Freeze>;
}

FreezeWrapper.propTypes = propTypes;
FreezeWrapper.defaultProps = defaultProps;

export default withWindowDimensions(FreezeWrapper);
