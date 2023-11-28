/* eslint-disable es/no-nullish-coalescing-operators */
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

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

    // TODO: temporary measure until linking config is adjusted
    if (pathname.startsWith('/r')) {
        return 'inbox';
    }

    if (pathname === 'home') {
        return 'inbox';
    }

    if (pathname === 'expenses' || pathname === 'insights') {
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

const propTypes = {
    // The session of the logged in person
    session: PropTypes.shape({
        // The email of the logged in person
        email: PropTypes.string,

        // The authToken of the logged in person
        authToken: PropTypes.string,
    }).isRequired,
};

function OldDotIFrame({session}) {
    const [oldDotURL, setOldDotURL] = useState('https://staging.expensify.com');

    useEffect(() => {
        setOldDotURL(`https://expensify.com.dev/${getOldDotURL(window.location.href)}`);

        window.addEventListener('message', (event) => {
            const url = event.data;
            // TODO: use this value to navigate to a new path
            // eslint-disable-next-line no-unused-vars
            const newDotURL = getNewDotURL(url);
        });
    }, []);

    useEffect(() => {
        document.cookie = `authToken=${session.authToken}; domain=expensify.com.dev; path=/;`;
        document.cookie = `email=${session.email}; domain=expensify.com.dev; path=/;`;
    }, [session.authToken, session.email]);

    return (
        <iframe
            style={{flex: 1}}
            src={oldDotURL}
            title="OldDot"
        />
    );
}

OldDotIFrame.propTypes = propTypes;

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(OldDotIFrame);
