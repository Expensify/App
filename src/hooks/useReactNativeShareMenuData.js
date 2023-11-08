import {useEffect, useState, useCallback} from 'react';
import ShareMenu from 'react-native-share-menu';
import isEmpty from 'lodash/isEmpty';

/**
 * Custom hook to handle data shared via the React Native Share Menu.
 * @returns {Object} An object containing the shared data and its MIME type.
 */
export default function useReactNativeShareMenuData() {
    /** @type {null | string} Shared data */
    const [sharedData, setSharedData] = useState(null);

    /** @type {null | string} MIME type of the shared data */
    const [sharedMimeType, setSharedMimeType] = useState(null);

    /**
     * Callback to handle received share data.
     * @param {Array} item - The shared item.
     */
    const handleShare = useCallback((item) => {
        console.log("RECEIVED:")
        console.log(item);
        if (!item || isEmpty(item) || !item[0].data || isEmpty(item[0].data)) {
            console.log(item);
            console.warn("Received empty share data");
            return;
        }

        const {mimeType, data} = item[0];

        console.log("Received Shared Data");
        console.log(data);

        setSharedData(data);
        setSharedMimeType(mimeType);

    }, []);

    // Get initial share when component mounts
    useEffect(() => {
        ShareMenu.getInitialShare((...args)=>{
            console.log("GET INITIAL SHARE")
            console.log(args)
            handleShare(args)
        });
    }, [handleShare]);

    // Add a listener for new shares
    useEffect(() => {
        const listener = ShareMenu.addNewShareListener((...args) => {
            console.log("SHARE LISTENER")
            console.log(args)
            handleShare(args)
        });

        // Clean up listener on unmount
        return () => {
            listener.remove();
        };
    }, [handleShare]);

    return {sharedData, sharedMimeType};
}
