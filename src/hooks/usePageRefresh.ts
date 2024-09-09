import {useEffect, useState} from 'react';
import {Platform} from 'react-native';

type UseDetectPageRefreshProps = {
    wasPageRefreshed: boolean;
};

function useDetectPageRefresh(): UseDetectPageRefreshProps {
    const [wasPageRefreshed, setWasPageRefreshed] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'web') {
            // Check if the navigation type is 'reload' to detect page refresh
            const isRefreshed = performance
                .getEntriesByType('navigation')
                .map((nav) => (nav as PerformanceNavigationTiming).type)
                .includes('reload');
            setWasPageRefreshed(isRefreshed);

            // Function to reset the refresh status after user interaction
            const resetRefreshStatus = () => {
                setWasPageRefreshed(false);
                window.removeEventListener('click', resetRefreshStatus);
                window.removeEventListener('keypress', resetRefreshStatus);
            };

            // Add event listeners to reset refresh status after user interaction
            if (isRefreshed) {
                window.addEventListener('click', resetRefreshStatus);
                window.addEventListener('keypress', resetRefreshStatus);
            }
        } else {
            // For non-web environments, always set refresh status to false
            setWasPageRefreshed(false);
        }
    }, []);

    return {wasPageRefreshed};
}

export default useDetectPageRefresh;