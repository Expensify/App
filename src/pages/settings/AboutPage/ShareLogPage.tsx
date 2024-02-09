import React from 'react';
import ShareLogList from './ShareLogList';

type ShareLogPageProps = {
    route: {
        params: {
            source: string;
        };
    };
};

function ShareLogPage({route}: ShareLogPageProps) {
    return <ShareLogList logSource={route.params.source} />;
}

export default ShareLogPage;
