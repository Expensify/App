import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';

import {useEffect} from 'react';

import type {NativeTabNavigation} from './NativeTabLayout';

type WorkspacesTabPressListenerProps = {
    /** The Workspaces tab's own navigation. */
    navigation: NativeTabNavigation;
};

/**
 * Runs the Workspaces tab button's navigation for a tap on the native Workspaces tab, focused or not: it restores the
 * last workspace or domain, falls back to the list for one that is gone, and keeps anonymous users out. It is its own
 * component, so the policy and domain collections it reads re-render only this listener.
 */
function WorkspacesTabPressListener({navigation}: WorkspacesTabPressListenerProps) {
    const navigateToWorkspaces = useRestoreWorkspacesTabOnNavigate();

    useEffect(() => navigation.addListener('tabPress', navigateToWorkspaces), [navigation, navigateToWorkspaces]);

    return null;
}

export default WorkspacesTabPressListener;
