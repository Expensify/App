import {useSyncExternalStore} from 'react';

// Moving the window to a display with another pixel ratio changes no layout, so nothing else re-renders the chart.
// A resolution query matches a single ratio, so it is re-armed for each new one.
function subscribe(onChange: () => void) {
    let query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const handleChange = () => {
        query.removeEventListener('change', handleChange);
        query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
        query.addEventListener('change', handleChange);
        onChange();
    };
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
}

function getSnapshot() {
    return window.devicePixelRatio;
}

function useDevicePixelRatio(): number {
    return useSyncExternalStore(subscribe, getSnapshot);
}

export default useDevicePixelRatio;
