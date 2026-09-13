/**
 * Lets a tester point the app at a different API server, and disables the choice on builds where the environment pins one.
 */
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import Text from '@components/Text';

import useActiveServer from '@hooks/useActiveServer';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {Server} from '@libs/ApiUtils';
import {isQAAuthConfigured} from '@libs/CloudflareAccess/Config';
import Navigation from '@libs/Navigation/Navigation';

import {setActiveServer} from '@userActions/User';

import CONST from '@src/CONST';

import React, {useState} from 'react';

type ServerListItem = ListItem & {keyForList: Server};

type ServerSelectorProps = {
    /** The test tools modal floats, so it leaves this off. */
    shouldAddBottomSafeAreaPadding?: boolean;
};

function ServerSelector({shouldAddBottomSafeAreaPadding = false}: ServerSelectorProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {activeServer, isPinnedByEnvironment, isStagingIgnored, isQASelectable} = useActiveServer();

    // The resolved server arrives a tick after mount, so it cannot seed this state
    const [pickedServer, setPickedServer] = useState<Server>();
    const selectedServer = pickedServer ?? activeServer;

    // Two separate facts: whether a stored QA would be honored at all, and whether this platform can sign in
    // to it. Offering QA without both would store a pick the resolver drops on the next read
    const canPickQA = isQASelectable && isQAAuthConfigured();
    const offeredServers = [CONST.SERVER.PRODUCTION, ...(isStagingIgnored ? [] : [CONST.SERVER.STAGING]), ...(canPickQA ? [CONST.SERVER.QA] : [])];

    // A pinned build can be on a server the list would not otherwise offer
    const listedServers = offeredServers.includes(activeServer) ? offeredServers : [...offeredServers, activeServer];

    const servers: ServerListItem[] = listedServers.map((server) => ({
        text: translate(`initialSettingsPage.troubleshoot.servers.${server}.label`),
        alternateText: translate(`initialSettingsPage.troubleshoot.servers.${server}.description`),
        keyForList: server,
        isSelected: selectedServer === server,
    }));

    const saveAndGoBack = () => {
        setActiveServer(selectedServer);
        Navigation.goBack();
    };

    const confirmButtonOptions = {
        showButton: !isPinnedByEnvironment,
        text: translate('common.save'),
        onConfirm: saveAndGoBack,
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

export default ServerSelector;
