import {useEffect, useState, useCallback} from 'react';
import ShareMenu from 'react-native-share-menu';
import isEmpty from 'lodash/isEmpty';

export default function useReactNativeShareMenuData() {
    const [sharedData, setSharedData] = useState(null);
    const [sharedMimeType, setSharedMimeType] = useState(null);

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

    useEffect(() => {
        ShareMenu.getInitialShare((...args)=>{
            console.log("GET INITIAL SHARE")
            console.log(args)
            handleShare(args)
        });
    }, [handleShare]);

    useEffect(() => {
        const listener = ShareMenu.addNewShareListener((...args) => {
            console.log("SHARE LISTENER")
            console.log(args)
            handleShare(args)
        });

        return () => {
            listener.remove();
        };
    }, [handleShare]);

    return {sharedData, sharedMimeType};

}
