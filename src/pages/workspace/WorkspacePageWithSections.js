import React from 'react';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import compose from '../../libs/compose';
import ROUTES from '../../ROUTES';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ONYXKEYS from '../../ONYXKEYS';
import userPropTypes from '../settings/userPropTypes';
import withPolicy from './withPolicy';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';

const propTypes = {
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

    /** User Data from Onyx */
    user: userPropTypes,

    /** Main content of the page */
    children: PropTypes.func,

    /** Content to be added as fixed footer */
    footer: PropTypes.element,

    /** The guides call task ID to associate with the workspace page being shown */
    guidesCallTaskID: PropTypes.string,

    /** Policy values needed in the component */
    policy: PropTypes.shape({
        name: PropTypes.string,
    }).isRequired,

    /** Option to use the default scroll view  */
    shouldUseScrollView: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    children: () => {},
    user: {},
    footer: null,
    guidesCallTaskID: '',
    shouldUseScrollView: false,
};


const WorkspacePageWithSections = props => {
    const isUsingECard = lodashGet(props.user, 'isUsingExpensifyCard', false);
    const policyID = lodashGet(props.route, 'params.policyID');
    const policyName = lodashGet(props.policy, 'name');

    return (
        <ScreenWrapper>
            <FullPageNotFoundView shouldShowBackButton={false} shouldShow={_.isEmpty(props.policy)}>
                <HeaderWithCloseButton
                    title={props.headerText}
                    subtitle={policyName}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={props.guidesCallTaskID}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.getWorkspaceInitialRoute(policyID))}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                {props.shouldUseScrollView
                    ? (
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            style={[styles.settingsPageBackground, styles.flex1, styles.w100]}
                        >
                            <View style={[styles.w100, styles.flex1]}>
                                {props.children(policyID, isUsingECard)}
                            </View>
                        </ScrollView>
                    )
                    : props.children(policyID, isUsingECard)}
                {props.footer}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
};

WorkspacePageWithSections.defaultProps = defaultProps;
WorkspacePageWithSections.displayName = 'WorkspacePageWithSections';
WorkspacePageWithSections.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
    withPolicy,
)(WorkspacePageWithSections);
