/* eslint-disable es/no-nullish-coalescing-operators */
import React, {useEffect, useState} from 'react';
import Navigation from '../libs/Navigation/Navigation';

function getNewDotURL(url) {
    const urlObj = new URL(url);
    const paramString = urlObj.searchParams.get('param') ?? '';
    const pathname = urlObj.pathname.slice(1);

    let params;
    try {
        params = JSON.parse(paramString);
    } catch {
        params = {};
    }

    if (pathname === 'inbox') {
        return 'home';
    }

    if (pathname === 'expenses') {
        return `${params.viewMode === 'charts' ? 'insights' : 'expenses'}${paramString ? `/?param=${paramString}` : ''}`;
    }

    if (pathname === 'admin_policies') {
        const {section} = params;
        return section === 'individual' ? 'individual_workspaces' : 'group_workspaces';
    }

    if (pathname === 'policy') {
        const workspaceID = params.policyID || '';
        const section = urlObj.hash.slice(1) || 'overview';

        return `workspace/${workspaceID}/${section}`;
    }

    if (pathname === 'settings') {
        const {section} = params;
        return `settings/${section}`;
    }

    if (pathname.includes('domain')) {
        return pathname;
    }

    return pathname;
}

function getOldDotURL(url) {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const paths = pathname.slice(1).split('/');

    if (pathname === 'home') {
        return 'inbox';
    }

    if (pathname === 'expenses' ?? pathname === 'insights') {
        return `expenses/${urlObj.search}`;
    }

    if (pathname === 'individual_workspaces' || pathname === 'group_workspaces') {
        const param = {section: pathname === 'individual_workspaces' ? 'individual' : 'group'};
        return `admin_policies?param=${JSON.stringify(param)}`;
    }

    if (pathname === 'workspace') {
        const [, workspaceID, section] = paths;
        const param = {policyID: workspaceID};
        return `policy/?param${JSON.stringify(param)}#${section}`;
    }

    if (pathname === 'settings') {
        const [, section] = paths;
        const param = {section};
        return `settings?param=${JSON.stringify(param)}`;
    }

    return pathname;
}

export default function ReportScreen() {
    const [oldDotURL, setOldDotURL] = useState('https://expensify.com.dev');

    useEffect(() => {
        const route = Navigation.getActiveRoute();
        setOldDotURL(`https://expensify.com.dev/${getOldDotURL(route)}`);

        window.addEventListener('message', (event) => {
            const url = event.data;
            const newDotURL = getNewDotURL(url);
        });
    }, []);

    return (
        <iframe
            style={{flex: 1}}
            src={oldDotURL}
            title="OldDot"
        />
    );
}
