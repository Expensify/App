import useOnyx from '@hooks/useOnyx';

import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';

import {setNewAgentAvatarPreset, setNewAgentUploadedAvatar} from '@userActions/Agent';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {useNavigation} from '@react-navigation/native';
import React from 'react';

import type {OnSaveParams} from './EditAgentAvatarPage';

import {EditAgentAvatarContent} from './EditAgentAvatarPage';

function AddAgentAvatarPage() {
    const navigation = useNavigation();
    const returnRoute = ROUTES.SETTINGS_AGENTS_ADD.getRoute();
    const [avatarDraft] = useOnyx(ONYXKEYS.AGENT_NEW_AVATAR_DRAFT);
    const initialPresetID = avatarDraft?.customExpensifyAvatarID;

    const handleSave = (params: OnSaveParams) => {
        // Wait for the async draft write to persist before navigating back, so a quick "Create agent" tap doesn't read a stale draft.
        const savePromise = 'customExpensifyAvatarID' in params ? setNewAgentAvatarPreset(params.customExpensifyAvatarID) : setNewAgentUploadedAvatar(params.file);

        savePromise
            .catch((error: unknown) => {
                Log.warn('Failed to persist the new-agent avatar draft', {error});
            })
            .finally(() => {
                // Do not navigate if user already left the screen while promise pending.
                if (!navigation.isFocused()) {
                    return;
                }
                Navigation.goBack(returnRoute);
            });
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

export default AddAgentAvatarPage;
