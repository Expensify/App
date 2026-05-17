import React, {useCallback, useEffect, useRef} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import {consumeNavigationToken, getInitialPresetID, setPendingAvatar} from '@pages/settings/Agents/pendingAgentAvatarStore';
import ROUTES from '@src/ROUTES';
import type {OnSaveParams} from './EditAgentAvatarPage';
import {EditAgentAvatarContent} from './EditAgentAvatarPage';

function AddAgentAvatarPage() {
    const didInitRef = useRef(false);

    useEffect(() => {
        if (didInitRef.current) {
            return;
        }
        didInitRef.current = true;

        if (consumeNavigationToken()) {
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_AGENTS_ADD);
    }, []);

    const initialPresetID = getInitialPresetID();

    const handleSave = useCallback((params: OnSaveParams) => {
        if ('customExpensifyAvatarID' in params) {
            setPendingAvatar({type: 'preset', id: params.customExpensifyAvatarID});
        } else {
            setPendingAvatar({type: 'file', file: params.file, uri: params.uri});
        }
        Navigation.goBack(ROUTES.SETTINGS_AGENTS_ADD);
    }, []);

    return (
        <EditAgentAvatarContent
            accountID={0}
            fallbackRoute={ROUTES.SETTINGS_AGENTS_ADD}
            onSave={handleSave}
            initialPresetID={initialPresetID}
        />
    );
}

AddAgentAvatarPage.displayName = 'AddAgentAvatarPage';

export default AddAgentAvatarPage;
