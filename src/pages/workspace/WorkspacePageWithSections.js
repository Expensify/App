import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import styles from '../../styles/styles';
import * as PolicyUtils from '../../libs/PolicyUtils';
import Navigation from '../../libs/Navigation/Navigation';
import compose from '../../libs/compose';
import ROUTES from '../../ROUTES';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import ONYXKEYS from '../../ONYXKEYS';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import BankAccount from '../../libs/models/BankAccount';
import * as ReimbursementAccountProps from '../ReimbursementAccount/reimbursementAccountPropTypes';
import userPropTypes from '../settings/userPropTypes';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import ScrollViewWithContext from '../../components/ScrollViewWithContext';
import useNetwork from '../../hooks/useNetwork';

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
};

function fetchData(skipVBBACal) {
    if (skipVBBACal) {
        return;
    }

    BankAccounts.openWorkspaceView();
}

function WorkspacePageWithSections({backButtonRoute, children, footer, guidesCallTaskID, headerText, policy, reimbursementAccount, route, shouldUseScrollView, shouldSkipVBBACall, user}) {
    useNetwork({onReconnect: () => fetchData(shouldSkipVBBACall)});

    const achState = lodashGet(reimbursementAccount, 'achData.state', '');
    const hasVBA = achState === BankAccount.STATE.OPEN;
    const isUsingECard = lodashGet(user, 'isUsingExpensifyCard', false);
    const policyID = lodashGet(route, 'params.policyID');
    const policyName = lodashGet(policy, 'name');
    const content = children(hasVBA, policyID, isUsingECard);

    useEffect(() => {
        fetchData(shouldSkipVBBACall);
    }, [shouldSkipVBBACall]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <FullPageNotFoundView
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
                shouldShow={_.isEmpty(policy) || !PolicyUtils.isPolicyAdmin(policy)}
                subtitleKey={_.isEmpty(policy) ? undefined : 'workspace.common.notAuthorized'}
            >
                <HeaderWithBackButton
                    title={headerText}
                    subtitle={policyName}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={guidesCallTaskID}
                    onBackButtonPress={() => Navigation.goBack(backButtonRoute || ROUTES.getWorkspaceInitialRoute(policyID))}
                />
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
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspacePageWithSections.propTypes = propTypes;
WorkspacePageWithSections.defaultProps = defaultProps;

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
