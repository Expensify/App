import React, {useEffect} from 'react';

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
        return `${params.viewMode === 'charts' ? 'insights' : 'expenses'}/${paramString}`;
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

export default function ReportScreen() {
    useEffect(() => {
        window.addEventListener('message', (event) => {
            const url = event.data;
            const newDotURL = getNewDotURL(url);
        });
    }, []);

    return (
        <iframe
            style={{flex: 1}}
            src="https://expensify.com.dev"
            title="OldDot"
        />
    );
}
