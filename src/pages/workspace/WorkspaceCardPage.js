import React from 'react';
import {
    View, ScrollView, StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import {withNavigationFocus} from '@react-navigation/compat';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import compose from '../../libs/compose';
import Text from '../../components/Text';
import Button from '../../components/Button';
import variables from '../../styles/variables';
import themeDefault from '../../styles/themes/default';
import ROUTES from '../../ROUTES';
import CONST from '../../CONST';
import Permissions from '../../libs/Permissions';
import HeroCardWebImage from '../../../assets/images/cascading-cards-web.svg';
import HeroCardMobileImage from '../../../assets/images/cascading-cards-mobile.svg';
import BankAccount from '../../libs/models/BankAccount';
import {openSignedInLink} from '../../libs/actions/App';
import {setWorkspaceIDForReimbursementAccount} from '../../libs/actions/BankAccounts';
import reimbursementAccountPropTypes from '../ReimbursementAccount/reimbursementAccountPropTypes';

const propTypes = {
    /* Onyx Props */

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** The details about the user that is signed in */
    user: PropTypes.shape({
        /** Whether or not the user has public domain */
        isFromPublicDomain: PropTypes.bool,

        /** Whether the user is using Expensify Card */
        isUsingExpensifyCard: PropTypes.bool,
    }),

    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** policyID passed via route: /workspace/:policyID/people */
            policyID: PropTypes.string,
        }),
    }).isRequired,

    /** Bank account currently in setup */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** Draft of bank account currently in setup */
    // eslint-disable-next-line react/forbid-prop-types
    reimbursementAccountDraft: PropTypes.object,

    /** Is WorkspaceCard screen focused */
    isFocused: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    user: {
        isFromPublicDomain: false,
        isUsingExpensifyCard: false,
    },
    reimbursementAccount: {
        loading: false,
    },
    reimbursementAccountDraft: {},
};

class WorkspaceCardPage extends React.Component {
    constructor(props) {
        super(props);

        this.onPress = this.onPress.bind(this);
        this.state = {
            buttonText: this.props.translate('workspace.card.getStarted'),
        };
    }

    componentDidMount() {
        if (!Permissions.canUseFreePlan(this.props.betas)) {
            console.debug('Not showing workspace card page because user is not on free plan beta');
            return Navigation.dismissModal();
        }
        const buttonText = this.getButtonText();
        this.setState({buttonText});
        if (buttonText === this.props.translate('workspace.card.finishSetup')) {
            this.openBankSetupModal();
        }
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.isFocused || nextProps.isFocused) {
            return true;
        }
        return false;
    }

    componentDidUpdate() {
        const buttonText = this.getButtonText();
        if (this.state.buttonText !== buttonText) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({buttonText});
        }
    }

    onPress() {
        if (this.props.user.isFromPublicDomain) {
            openSignedInLink(CONST.ADD_SECONDARY_LOGIN_URL);
        } else if (this.props.user.isUsingExpensifyCard) {
            openSignedInLink(CONST.MANAGE_CARDS_URL);
        } else {
            this.openBankSetupModal();
        }
    }

    getButtonText() {
        const achState = lodashGet(this.props.reimbursementAccount, 'achData.state', '');
        const shouldFinishSetup = !_.every(Object.values(this.props.reimbursementAccountDraft), value => value === '')
            || achState === BankAccount.STATE.SETUP
            || achState === BankAccount.STATE.VERIFYING
            || achState === BankAccount.STATE.PENDING
            || achState === BankAccount.STATE.OPEN;

        if (this.props.user.isFromPublicDomain) {
            return this.props.translate('workspace.card.addEmail');
        }
        if (this.props.user.isUsingExpensifyCard) {
            return this.props.translate('workspace.card.manageCards');
        }
        if (shouldFinishSetup) {
            return this.props.translate('workspace.card.finishSetup');
        }
        return this.props.translate('workspace.card.getStarted');
    }

    openBankSetupModal() {
        setWorkspaceIDForReimbursementAccount(this.props.route.params.policyID);
        Navigation.navigate(ROUTES.getBankAccountRoute());
    }

    render() {
        return (
            <ScreenWrapper style={[styles.defaultModalContainer]}>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.common.card')}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                    onBackButtonPress={() => Navigation.goBack()}
                    shouldShowBackButton={this.props.isSmallScreenWidth}
                    shouldShowInboxCallButton
                    inboxCallTaskID="WorkspaceCompanyCards"
                />
                <ScrollView style={[styles.settingsPageBackground]}>
                    <View style={styles.pageWrapper}>
                        <View style={[
                            styles.mb3,
                            styles.flexRow,
                            styles.workspaceCard,
                            this.props.isSmallScreenWidth && styles.workspaceCardMobile,
                            this.props.isMediumScreenWidth && styles.workspaceCardMediumScreen,
                        ]}
                        >
                            {this.props.isSmallScreenWidth || this.props.isMediumScreenWidth
                                ? (
                                    <HeroCardMobileImage
                                        style={StyleSheet.flatten([
                                            styles.fullscreenCard,
                                            this.props.isSmallScreenWidth && styles.fullscreenCardMobile,
                                            this.props.isMediumScreenWidth && styles.fullscreenCardMediumScreen,
                                        ])}
                                    />
                                )
                                : (
                                    <HeroCardWebImage
                                        style={StyleSheet.flatten([styles.fullscreenCard, styles.fullscreenCardWeb])}
                                    />
                                )}

                            <View style={[
                                styles.fullscreenCard,
                                styles.workspaceCardContent,
                                this.props.isSmallScreenWidth && styles.p5,
                                this.props.isMediumScreenWidth && styles.workspaceCardContentMediumScreen,
                            ]}
                            >
                                <View
                                    style={[
                                        styles.flexGrow1,
                                        styles.justifyContentEnd,
                                        styles.alignItemsStart,
                                        !this.props.isSmallScreenWidth && styles.w50,
                                        this.props.isMediumScreenWidth && styles.w100,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.workspaceCardMainText,
                                            styles.mb5,
                                        ]}
                                        color={themeDefault.textReversed}
                                    >
                                        {this.props.user.isUsingExpensifyCard
                                            ? this.props.translate('workspace.card.cardReadyTagline')
                                            : this.props.translate('workspace.card.tagline')}
                                    </Text>
                                    <Text
                                        fontSize={variables.fontSizeLarge}
                                        color={themeDefault.textReversed}
                                        style={[styles.mb8]}
                                    >
                                        {this.props.user.isFromPublicDomain
                                            ? this.props.translate('workspace.card.publicCopy')
                                            : this.props.translate('workspace.card.privateCopy')}
                                    </Text>
                                    <Button
                                        style={[
                                            styles.alignSelfStart,
                                            styles.workspaceCardCTA,
                                            this.props.isSmallScreenWidth ? styles.wAuto : {},
                                        ]}
                                        textStyles={
                                            !this.props.isSmallScreenWidth ? [styles.pr5, styles.pl5] : []
                                        }
                                        onPress={this.onPress}
                                        success
                                        large
                                        text={this.state.buttonText}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </ScreenWrapper>
        );
    }
}

WorkspaceCardPage.propTypes = propTypes;
WorkspaceCardPage.defaultProps = defaultProps;
WorkspaceCardPage.displayName = 'WorkspaceCardPage';

export default compose(
    withLocalize,
    withWindowDimensions,
    withNavigationFocus,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        reimbursementAccountDraft: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(WorkspaceCardPage);
