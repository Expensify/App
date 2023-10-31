/* eslint-disable es/no-nullish-coalescing-operators */
import {useNavigationState} from '@react-navigation/native';
import lodashFindLast from 'lodash/findLast';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import getTopMostCentralPaneRouteName from '@libs/Navigation/getTopMostCentralPaneRouteName';
import navigation from '@libs/Navigation/Navigation';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import FullPageBiggerScreenView from './BlockingViews/FullPageBiggerScreenView';
import Button from './Button';

function addNewDotParams(url) {
    const urlObj = new URL(url);
    urlObj.searchParams.append('isInNewDot', true);
    urlObj.searchParams.append('isDarkMode', true);
    return decodeURIComponent(urlObj.toString());
}

function getNewDotURL(url) {
    const {OLDDOT_URL_SECTION} = CONST;
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
        return ROUTES.HOME_OLDDOT;
    }

    if (pathname === 'expenses') {
        return `${params.viewMode === 'charts' ? ROUTES.INSIGHTS_OLDDOT : ROUTES.EXPENSES_OLDDOT}${paramString ? `/?param=${paramString}` : ''}`;
    }

    if (pathname === 'admin_policies') {
        const {section} = params;
        return section === 'individual' ? ROUTES.INDIVIDUAL_OLDDOT : ROUTES.GROUPS_OLDDOT;
    }

    if (pathname === 'policy') {
        const workspaceID = params.policyID ?? '';
        const section = urlObj.hash.slice(1) ?? '';

        let sectionName = section;
        switch (section) {
            case '':
                sectionName = OLDDOT_URL_SECTION.OVERVIEW;
                break;
            case 'js_policyEditor_perDiem':
                sectionName = OLDDOT_URL_SECTION.PER_DIEM;
                break;
            case 'exportFormats':
                sectionName = OLDDOT_URL_SECTION.EXPORT_FORMATS;
                break;
            default:
                sectionName = section;
        }

        return ROUTES.WORKSPACES_OLDDOT.getRoute(workspaceID, sectionName);
    }

    if (pathname === 'settings') {
        const {section} = params;

        let sectionName = '';
        switch (section) {
            case undefined:
            case '':
                sectionName = OLDDOT_URL_SECTION.ACCOUNT;
                break;
            case 'expenserules':
                sectionName = OLDDOT_URL_SECTION.EXPENSE_RULES;
                break;
            case 'creditcards':
                sectionName = OLDDOT_URL_SECTION.CREDIT_CARDS;
                break;
            default:
                sectionName = section;
        }

        return `settings/${sectionName}`;
    }

    if (pathname === 'admin_domains') {
        return ROUTES.DOMAINS_OLDDOT;
    }

    if (pathname.includes('domain')) {
        const [, section] = pathname.split('_');

        let sectionName = '';
        switch (section) {
            case '':
            case 'companycards':
                sectionName = OLDDOT_URL_SECTION.CARDS;
                break;
            case 'loadingDock':
                sectionName = OLDDOT_URL_SECTION.TOOLS;
                break;
            default:
                sectionName = section;
        }

        return ROUTES.DOMAIN_OLDDOT.getRoute(sectionName);
    }

    return pathname;
}

function getOldDotURL(screenName, params) {
    if (screenName === SCREENS.HOME_OLDDOT) {
        return 'inbox';
    }

    if (screenName === SCREENS.EXPENSES_OLDDOT || screenName === SCREENS.INSIGHTS_OLDDOT) {
        return params ? `expenses/param=${params.param}` : 'expenses';
    }

    if (screenName === SCREENS.INDIVIDUAL_WORKSPACE_OLDDOT || screenName === SCREENS.GROUPS_WORKSPACES_OLDDOT) {
        const param = {section: screenName === SCREENS.INDIVIDUAL_WORKSPACE_OLDDOT ? 'individual' : 'group'};
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
        return `policy/?param=${JSON.stringify(param)}#${olddotSection}`;
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

        return `domain_${olddotSection}`;
    }

    if (screenName === SCREENS.REPORTS_OLDDOT) {
        return 'reports';
    }

    if (screenName === SCREENS.OLD_DOT_TEST) {
        return 'domain-test';
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
    if (routeName !== undefined && routeName !== 'Report') {
        const topMostCentralPane = lodashFindLast(state.routes, (route) => route.name === 'CentralPaneNavigator');
        if (topMostCentralPane && topMostCentralPane.state) {
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
const BASE_IFRAME_URL = 'https://staging.expensify.com';

function IFrame({session}) {
    // TODO: This is not necessary anymore but I'm leaving it here for now so we can see what URL is currently loaded in the iframe.
    const [oldDotURL, setOldDotURL] = useState(undefined);
    const {routeName, params} = useNavigationState((state) => getIframeRouteNameAndParams(state));
    const iframeElement = React.useRef(null);

    useEffect(() => {
        window.addEventListener('message', (event) => {
            const {data} = event;

            if (data.iFrameId !== 'OldDot' || data.type !== 'URL_CHANGED') {
                return;
            }

            // TODO: use this value to navigate to a new path
            // eslint-disable-next-line no-unused-vars
            const newDotURL = getNewDotURL(data.payload);

            // TODO: The line below should be enough but I can't test it because of cookies issue.
            // navigation.navigate(newDotURL);
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

        // TODO: We probably should check if current URL is the same as the new one to avoid unnecessary reloads.
        // especialy in the case of navigation triggered by the olddot.
        // We use replace to avoid excess history entries after changing src.
        iframeElement.current.contentWindow.location.replace(addNewDotParams(`${BASE_IFRAME_URL}/${newOldDotURL}`));
        // TODO: remove this after removing the text with information about current olddot url
        setOldDotURL(addNewDotParams(`${BASE_IFRAME_URL}/${newOldDotURL}`));
    }, [routeName, params]);

    useEffect(() => {
        document.cookie = `authToken=${session.authToken}; domain=staging.expensify.com; path=/;secure;`;
        document.cookie = `email=${session.email}; domain=staging.expensify.com; path=/;secure;`;
    }, [session.authToken, session.email]);

    const [time] = useState(new Date().getSeconds());

    const isScreenWithoutSubnavSelected = routeName === SCREENS.HOME_OLDDOT;

    return (
        <FullPageBiggerScreenView>
            {/* These containers are necessary for home page to have rounded corner */}
            <View style={styles.iframeContainer}>
                <View style={styles.innerIframeContainer(isScreenWithoutSubnavSelected)}>
                    {/* TODO: Remove text with information */}
                    <Text style={{fontSize: 40, color: 'white'}}>{`${routeName}\n${JSON.stringify(params)} \n${oldDotURL}\n${time}`}</Text>
                    <Button
                        text="go to nested domains"
                        onPress={() => navigation.navigate(ROUTES.DOMAIN_COMPANY_CARDS_OLDDOT)}
                    />
                    <Button
                        text="go to nested workspace"
                        onPress={() => navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_OLDDOT)}
                    />
                    <iframe
                        // If we don't remount iframe it will mess up with the browser history.
                        ref={iframeElement}
                        style={styles.iframe}
                        title="OldDot"
                    />
                </View>
            </View>
        </FullPageBiggerScreenView>
    );
}

IFrame.propTypes = propTypes;

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(IFrame);
