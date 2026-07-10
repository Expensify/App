import Navigation from '@libs/Navigation/Navigation';

import {getInitialPresetID, getReturnRoute, setPendingAvatar} from '@pages/settings/Agents/pendingAgentAvatarStore';

import ROUTES from '@src/ROUTES';

import React from 'react';

import type {OnSaveParams} from './EditAgentAvatarPage';

import {EditAgentAvatarContent} from './EditAgentAvatarPage';

function AddAgentAvatarPage() {
    const returnRoute = getReturnRoute() ?? ROUTES.SETTINGS_AGENTS_ADD.getRoute();
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
