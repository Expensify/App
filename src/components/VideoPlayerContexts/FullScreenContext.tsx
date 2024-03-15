import {last} from 'lodash';
import PropTypes from 'prop-types';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import useCurrentReportID from '@hooks/useCurrentReportID';

const FullScreenContext = React.createContext(null);

function FullScreenContextProvider({children}) {
    const isFullscreen = useRef(false);
    const lastWindowDimensions = useRef(null);

    const update = useCallback((obj: any) => {
        lastWindowDimensions.current = obj;
    }, []);

    const contextValue = useMemo(() => ({isFullscreen, lastWindowDimensions, update}), []);
    return <FullScreenContext.Provider value={contextValue}>{children}</FullScreenContext.Provider>;
}

function useFullScreenContext() {
    const context = useContext(FullScreenContext);
    if (context === undefined) {
        throw new Error('usePlaybackContext must be used within a PlaybackContextProvider');
    }
    return context;
}

FullScreenContextProvider.displayName = 'PlaybackContextProvider';
FullScreenContextProvider.propTypes = {
    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

export {FullScreenContext, FullScreenContextProvider, useFullScreenContext};
