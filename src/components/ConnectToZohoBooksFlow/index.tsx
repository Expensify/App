import useEnvironment from '@hooks/useEnvironment';

import connectToZohoBooksOAuth from '@pages/workspace/accounting/zohoBooks/connectToZohoBooksOAuth';

import {useEffect} from 'react';

type ConnectToZohoBooksFlowProps = {
    policyID: string;
};

function ConnectToZohoBooksFlow({policyID}: ConnectToZohoBooksFlowProps) {
    const {environmentURL} = useEnvironment();

    useEffect(() => {
        connectToZohoBooksOAuth(policyID, environmentURL);
        // This needs to run once as it starts the OAuth flow
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToZohoBooksFlow;
