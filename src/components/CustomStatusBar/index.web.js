import React from 'react';
import {StatusBar} from 'react-native';
import {getPathFromState} from '@react-navigation/native';
import Text from '../Text';
import Navigation from '../../libs/Navigation/navigationRef';
import linkingConfig from '../../libs/Navigation/linkingConfig';
import './styles.css';

const isCapableOfOverlay = 'windowControlsOverlay' in navigator;
const OverlayAPI = navigator.windowControlsOverlay;

const CustomStatusBar = () => {
    const [showOverlayBar, setShowOverlayBar] = React.useState(isCapableOfOverlay && OverlayAPI.visible);
    const [route, setRoute] = React.useState('');

    React.useEffect(() => {
        if (!isCapableOfOverlay) {
            return () => {};
        }

        const overlayListener = event => setShowOverlayBar(event.visible);
        OverlayAPI.addEventListener('geometrychange', overlayListener);

        const navigationListener = (event) => {
            const path = getPathFromState(event.data.state, linkingConfig.config);
            setRoute(path);
        };

        Navigation.addListener('state', navigationListener);

        return () => {
            OverlayAPI.removeEventListener('geometrychange', overlayListener);
            Navigation.removeListener('state', navigationListener);
        };
    }, []);

    if (showOverlayBar) {
        return (
            <div className="status-bar">
                <div className="status-bar-content">
                    <Text fontSize={14}>{route}</Text>
                </div>
            </div>
        );
    }

    return <StatusBar />;
};

export default CustomStatusBar;
