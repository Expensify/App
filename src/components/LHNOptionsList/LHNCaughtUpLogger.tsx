import {useEffect} from 'react';
import Log from '@libs/Log';

function LHNCaughtUpLogger() {
    useEffect(() => {
        Log.info('Woohoo! All caught up. Was rendered', false);
    }, []);

    return null;
}

export default LHNCaughtUpLogger;
