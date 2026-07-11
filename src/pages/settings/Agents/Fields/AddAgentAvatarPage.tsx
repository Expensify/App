import Navigation from '@libs/Navigation/Navigation';

import {consumeNavigationToken, getInitialPresetID, getReturnRoute, setPendingAvatar} from '@pages/settings/Agents/pendingAgentAvatarStore';

import ROUTES from '@src/ROUTES';

import React, {useEffect, useRef} from 'react';

import type {OnSaveParams} from './EditAgentAvatarPage';

import {EditAgentAvatarContent} from './EditAgentAvatarPage';

function AddAgentAvatarPage() {
    const didInitRef = useRef(false);
    const returnRoute = getReturnRoute() ?? ROUTES.SETTINGS_AGENTS_ADD.getRoute();

    useEffect(() => {
        if (didInitRef.current) {
            return;
        }
        didInitRef.current = true;

        if (consumeNavigationToken()) {
            return;
        }
        Navigation.navigate(returnRoute);
    }, [returnRoute]);

    const initialPresetID = getInitialPresetID();

    const handleSave = (params: OnSaveParams) => {
        if ('customExpensifyAvatarID' in params) {
            setPendingAvatar({type: 'preset', id: params.customExpensifyAvatarID});
        } else {
            setPendingAvatar({type: 'file', file: params.file, uri: params.uri});
        }
        Navigation.goBack(returnRoute);
    };

    return (
        <EditAgentAvatarContent
            accountID={0}
            fallbackRoute={returnRoute}
            onSave={handleSave}
            initialPresetID={initialPresetID}
        />
    );
}

AddAgentAvatarPage.displayName = 'AddAgentAvatarPage';

export default AddAgentAvatarPage;
