import HeaderWithBackButton from '@components/HeaderWithBackButton';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import Text from '@components/Text';

import useActiveServer from '@hooks/useActiveServer';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {isQAAuthConfigured} from '@libs/CloudflareAccess/Config';
import Navigation from '@libs/Navigation/Navigation';

import {setActiveServer} from '@userActions/User';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React, {useState} from 'react';

type Server = ValueOf<typeof CONST.SERVER>;

type ServerListItem = ListItem & {keyForList: Server};

const ALWAYS_SELECTABLE_SERVERS = [CONST.SERVER.PRODUCTION, CONST.SERVER.STAGING] as const;

type ServerSelectorProps = {
    /** Pads for the device safe area. The test tools modal floats, so it must not. */
    shouldAddBottomSafeAreaPadding?: boolean;
};

function ServerSelector({shouldAddBottomSafeAreaPadding = false}: ServerSelectorProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {activeServer, isPinnedByEnvironment} = useActiveServer();

    // The resolved server arrives a tick after mount, so the selection follows it until a row is picked
    const [pickedServer, setPickedServer] = useState<Server>();
    const selectedServer = pickedServer ?? activeServer;

    const offeredServers: Server[] = [...ALWAYS_SELECTABLE_SERVERS, ...(isQAAuthConfigured() ? [CONST.SERVER.QA] : [])];

    // A pinned build fixes the answer, so its server is listed even where the selector would not offer it
    const listedServers: Server[] = offeredServers.includes(activeServer) ? offeredServers : [...offeredServers, activeServer];

    const servers: ServerListItem[] = listedServers.map((server) => ({
        text: translate(`initialSettingsPage.troubleshoot.servers.${server}.label`),
        alternateText: translate(`initialSettingsPage.troubleshoot.servers.${server}.description`),
        keyForList: server,
        isSelected: selectedServer === server,
    }));

    const confirmButtonOptions = {
        showButton: !isPinnedByEnvironment,
        text: translate('common.save'),
        onConfirm: () => setActiveServer(selectedServer),
        isDisabled: selectedServer === activeServer,
    };

    return (
        <>
            <HeaderWithBackButton
                title={translate('initialSettingsPage.troubleshoot.server')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <SelectionList
                data={servers}
                ListItem={SingleSelectListItem}
                onSelectRow={(server: ServerListItem) => setPickedServer(server.keyForList)}
                shouldSingleExecuteRowSelect
                confirmButtonOptions={confirmButtonOptions}
                // A pinned build ignores whatever is stored, so the rows report the servers rather than offering them
                isDisabled={isPinnedByEnvironment}
                customListHeaderContent={
                    isPinnedByEnvironment ? <Text style={[styles.mh5, styles.mv3]}>{translate('initialSettingsPage.troubleshoot.serverPinnedDescription')}</Text> : undefined
                }
                initiallyFocusedItemKey={activeServer}
                addBottomSafeAreaPadding={shouldAddBottomSafeAreaPadding}
            />
        </>
    );
}

ServerSelector.displayName = 'ServerSelector';

export default ServerSelector;
