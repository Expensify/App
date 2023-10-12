/* eslint-disable es/no-nullish-coalescing-operators */
import React, {useEffect, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {useNavigationState} from '@react-navigation/native';
import {Text} from 'react-native';
import lodashFindLast from 'lodash/findLast';
import ONYXKEYS from '../ONYXKEYS';

import getTopMostCentralPaneRouteName from '../libs/Navigation/getTopMostCentralPaneRouteName';
import SCREENS from '../SCREENS';

// TODO: use consts from ROUTES
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
        const workspaceID = params.policyID ?? '';
        const section = urlObj.hash.slice(1) ?? '';

        let sectionName = section;
        switch (section) {
            case '':
                sectionName = 'overview';
                break;
            case 'js_policyEditor_perDiem':
                sectionName = 'per-diem';
                break;
            case 'exportFormats':
                sectionName = 'export-formats';
                break;
            default:
                sectionName = section;
        }

        return `workspace/${workspaceID}/${sectionName}`;
    }

    if (pathname === 'settings') {
        const {section} = params;

        let sectionName = '';
        switch (section) {
            case undefined:
            case '':
                sectionName = 'account';
                break;
            case 'expenserules':
                sectionName = 'expense-rules';
                break;
            case 'creditcards':
                sectionName = 'cards';
                break;
            default:
                sectionName = section;
        }

        return `settings/${sectionName}`;
    }

    if (pathname === 'admin_domains') {
        return 'domains';
    }

    if (pathname.includes('domain')) {
        const [, section] = pathname.split('_');

        let sectionName = '';
        switch (section) {
            case '':
            case 'companycards':
                sectionName = 'cards';
                break;
            case 'loadingDock':
                sectionName = 'tools';
                break;
            default:
                sectionName = section;
        }

        return `domain/${sectionName}`;
    }

    return pathname;
}

function getOldDotURL(screenName, params) {
    if (screenName === SCREENS.HOME_OLDDOT) {
        return 'inbox';
    }

    if (screenName === SCREENS.EXPENSES_OLDDOT || screenName === SCREENS.INSIGHTS_OLDDOT) {
        return params ? `expenses/${params.param}` : 'expenses';
    }

    if (screenName === SCREENS.INDIVIDUAL_WORKSPACES_OLDDOT || screenName === SCREENS.GROUPS_WORKSPACES_OLDDOT) {
        const param = {section: screenName === SCREENS.INDIVIDUAL_WORKSPACES_OLDDOT ? 'individual' : 'group'};
        return `admin_policies?param=${JSON.stringify(param)}`;
    }

    if (screenName === SCREENS.WORKSPACE_OLDDOT) {
        const {workspaceID, section} = params;

        let olddotSection = '';
        switch (section) {
            case 'overview':
                olddotSection = '';
                break;
            case 'per-diem':
                olddotSection = 'js_policyEditor_perDiem';
                break;
            case 'export-formats':
                olddotSection = 'exportFormats';
                break;
            default:
                olddotSection = section;
        }

        const param = {policyID: workspaceID};
        return `policy/?param${JSON.stringify(param)}#${olddotSection}`;
    }

    if (screenName === SCREENS.DOMAINS_OLDDOT) {
        return 'admin_domains';
    }

    if (screenName === SCREENS.DOMAIN_OLDDOT) {
        const {section} = params;

        let olddotSection = '';
        switch (section) {
            case 'cards':
                olddotSection = 'companycards';
                break;
            case 'tools':
                olddotSection = 'loadingDock';
                break;
            default:
                olddotSection = section;
        }

        return `domain/${olddotSection}`;
    }

    if (screenName === SCREENS.REPORTS_OLDDOT) {
        return 'reports';
    }

    return undefined;
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

// Gets the routeName and params of the top most central pane route if it is an iframe route.
// If the top most central pane route is not an iframe route, then it returns undefined.
function getIframeRouteNameAndParams(state) {
    const routeName = getTopMostCentralPaneRouteName(state);
    if (routeName !== 'Report') {
        const topMostCentralPane = lodashFindLast(state.routes, (route) => route.name === 'CentralPaneNavigator');
        if (topMostCentralPane.state) {
            const params = topMostCentralPane.state.routes[topMostCentralPane.state.index || 0].params;
            return {routeName, params};
        }

        const params = topMostCentralPane.params;
        if (params) {
            return {routeName, params: params.params};
        }
    }
    return {routeName: undefined, params: undefined};
}

// TODO: use proper URL
const BASE_IFRAME_URL = 'http://localhost:3000';

function IFrame({session}) {
    const [oldDotURL, setOldDotURL] = useState(undefined);
    const {routeName, params} = useNavigationState((state) => getIframeRouteNameAndParams(state));

    useEffect(() => {
        window.addEventListener('message', (event) => {
            let data = {};
            try {
                data = JSON.parse(event.data);
            } catch {
                data = {};
            }

            if (data.iframeId !== 'OldDot' || data.type !== 'URL_CHANGED') {
                return;
            }

            const {url} = data.payload ?? {};

            // TODO: use this value to navigate to a new path
            // eslint-disable-next-line no-unused-vars
            const newDotURL = getNewDotURL(url);
        });
    }, []);

    useEffect(() => {
        // The routeName will be undefined if there is no iframe route on the top.
        // In that case we don't want to change the iframe URL.
        if (!routeName) {
            return;
        }

        const newOldDotURL = getOldDotURL(routeName, params);
        if (!newOldDotURL) {
            console.error(`No old dot URL found for routeName: ${routeName} and params: ${JSON.stringify(params)}`);
            return;
        }

        setOldDotURL(`${BASE_IFRAME_URL}/${newOldDotURL}`);
    }, [routeName, params]);

    useEffect(() => {
        document.cookie = `authToken=${session.authToken}; domain=expensify.com.dev; path=/;`;
        document.cookie = `email=${session.email}; domain=expensify.com.dev; path=/;`;
    }, [session.authToken, session.email]);

    return (
        <>
            {/* TODO: Remove text with information */}
            <Text style={{fontSize: 40, color: 'white'}}>{`${routeName}\n${JSON.stringify(params)} \n${oldDotURL}`}</Text>
            <iframe
                style={{flex: 1, borderWidth: 0}}
                src={oldDotURL}
                title="OldDot"
            />
        </>
    );
}

IFrame.propTypes = propTypes;

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(IFrame);
