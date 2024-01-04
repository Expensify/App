import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollViewWithContext from '@components/ScrollViewWithContext';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import BankAccount from '@libs/models/BankAccount';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import userPropTypes from '@pages/settings/userPropTypes';
import * as BankAccounts from '@userActions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

const propTypes = {
    shouldSkipVBBACall: PropTypes.bool,

    /** The text to display in the header */
    headerText: PropTypes.string.isRequired,

    /** The route object passed to this page from the navigator */
    route: PropTypes.shape({
        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** The policyID that is being configured */
            policyID: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,

    /** From Onyx */
    /** Bank account attached to free plan */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes,

    /** User Data from Onyx */
    user: userPropTypes,

    /** Main content of the page */
    children: PropTypes.func,

    /** Content to be added as fixed footer */
    footer: PropTypes.element,

    /** The guides call task ID to associate with the workspace page being shown */
    guidesCallTaskID: PropTypes.string,

    /** The route where we navigate when the user press the back button */
    backButtonRoute: PropTypes.string,

    /** Policy values needed in the component */
    policy: PropTypes.shape({
        name: PropTypes.string,
    }).isRequired,

    /** Option to use the default scroll view  */
    shouldUseScrollView: PropTypes.bool,

    /** Option to show the loading page while the API is calling */
    shouldShowLoading: PropTypes.bool,
};

const defaultProps = {
    children: () => {},
    user: {},
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    footer: null,
    guidesCallTaskID: '',
    shouldUseScrollView: false,
    shouldSkipVBBACall: false,
    backButtonRoute: '',
    shouldShowLoading: true,
};

function fetchData(skipVBBACal) {
    if (skipVBBACal) {
        return;
    }

    BankAccounts.openWorkspaceView();
}

function WorkspacePageWithSections({
    backButtonRoute,
    children,
    footer,
    guidesCallTaskID,
    headerText,
    policy,
    reimbursementAccount,
    route,
    shouldUseScrollView,
    shouldSkipVBBACall,
    user,
    shouldShowLoading,
}) {
    const styles = useThemeStyles();
    useNetwork({onReconnect: () => fetchData(shouldSkipVBBACall)});

    const isLoading = lodashGet(reimbursementAccount, 'isLoading', true);
    const achState = lodashGet(reimbursementAccount, 'achData.state', '');
    const hasVBA = achState === BankAccount.STATE.OPEN;
    const isUsingECard = lodashGet(user, 'isUsingExpensifyCard', false);
    const policyID = lodashGet(route, 'params.policyID');
    const policyName = lodashGet(policy, 'name');
    const content = children(hasVBA, policyID, isUsingECard);
    const firstRender = useRef(true);

    useEffect(() => {
        // Because isLoading is false before merging in Onyx, we need firstRender ref to display loading page as well before isLoading is change to true
        firstRender.current = false;
    }, []);

    useEffect(() => {
        fetchData(shouldSkipVBBACall);
    }, [shouldSkipVBBACall]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={WorkspacePageWithSections.displayName}
        >
            <FullPageNotFoundView
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
                shouldShow={_.isEmpty(policy) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy)}
                subtitleKey={_.isEmpty(policy) ? undefined : 'workspace.common.notAuthorized'}
            >
                <HeaderWithBackButton
                    title={headerText}
                    subtitle={policyName}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={guidesCallTaskID}
                    onBackButtonPress={() => Navigation.goBack(backButtonRoute || ROUTES.WORKSPACE_INITIAL.getRoute(policyID))}
                />
                {(isLoading || firstRender.current) && shouldShowLoading ? (
                    <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                ) : (
                    <>
                        {shouldUseScrollView ? (
                            <ScrollViewWithContext
                                keyboardShouldPersistTaps="handled"
                                style={[styles.settingsPageBackground, styles.flex1, styles.w100]}
                            >
                                <View style={[styles.w100, styles.flex1]}>{content}</View>
                            </ScrollViewWithContext>
                        ) : (
                            content
                        )}
                        {footer}
                    </>
                )}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspacePageWithSections.propTypes = propTypes;
WorkspacePageWithSections.defaultProps = defaultProps;
WorkspacePageWithSections.displayName = 'WorkspacePageWithSections';

export default compose(
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
    withPolicyAndFullscreenLoading,
)(WorkspacePageWithSections);
