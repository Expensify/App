import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import {createContext, useContext, useEffect, useState} from 'react';
import {Platform} from 'react-native';
import ShareMenu from 'react-native-share-menu';
import ROUTES from '@src/ROUTES';
import Navigation from '@libs/Navigation/Navigation';

const hasNoShareData = (share) => !share || !share.data || isEmpty(share.data);

const normalizeShareData = (shared) => (isArray(shared.data) ? shared.data[0] : shared);

const formatShareData = (shared) => {
    const share = normalizeShareData(shared);
    return {
        isTextShare: share.mimeType === 'text/plain',
        name: share.data.split('/').pop(),
        source: share.data,
        type: share.mimeType,
        uri: share.data,
    };
};

const ShareContext = createContext(null);

function Provider(props) {
    const [shareData, setShareData] = useState(null);

    const handleShareData = (share) => {
        if (hasNoShareData(share)) {
            return;
        }
        setShareData(formatShareData(share));

        // iOS deep links directly to the share flow, with Android we need to manually navigate
        if (Platform.OS === 'android') {
            Navigation.isNavigationReady().then(() => {
                Navigation.navigate(ROUTES.SHARE);
            });
        }
    };

    ShareMenu.getInitialShare(handleShareData);
    useEffect(() => {
        const listener = ShareMenu.addNewShareListener(handleShareData);
        return listener.remove;
    }, []);

    return <ShareContext.Provider value={shareData}>{props.children}</ShareContext.Provider>;
}

Provider.propTypes = {
    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

const useShareData = () => useContext(ShareContext);

export {Provider, useShareData};
