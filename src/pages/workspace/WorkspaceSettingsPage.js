import React from 'react';
import PropTypes from 'prop-types';
import {Keyboard, ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import BankAccount from '../../libs/models/BankAccount';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import reimbursementAccountPropTypes from '../ReimbursementAccount/reimbursementAccountPropTypes';
import ROUTES from '../../ROUTES';
import compose from '../../libs/compose';
import * as Policy from '../../libs/actions/Policy';
import Icon from '../../components/Icon';
import * as Expensicons from '../../components/Icon/Expensicons';
import AvatarWithImagePicker from '../../components/AvatarWithImagePicker';
import defaultTheme from '../../styles/themes/default';
import CONST from '../../CONST';
import Picker from '../../components/Picker';
import TextInput from '../../components/TextInput';
import withPolicy, {policyPropTypes, policyDefaultProps} from './withPolicy';
import {withNetwork} from '../../components/OnyxProvider';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import Form from '../../components/Form';

const propTypes = {
    /** From Onyx */
    /** Bank account currently in setup */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** The route object passed to this page from the navigator */
    route: PropTypes.shape({
        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** The policyID that is being configured */
            policyID: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,

    ...policyPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    reimbursementAccount: {},

    ...policyDefaultProps,
};

class WorkspaceSettingsPage extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);
        this.getCurrencyItems = this.getCurrencyItems.bind(this);
        this.validate = this.validate.bind(this);
    }

    componentDidMount() {
        BankAccounts.openWorkspaceView();
    }

    /**
     * @returns {Object[]}
     */
    getCurrencyItems() {
        const currencyListKeys = _.keys(this.props.currencyList);
        return _.map(currencyListKeys, currencyCode => ({
            value: currencyCode,
            label: `${currencyCode} - ${this.props.currencyList[currencyCode].symbol}`,
        }));
    }

    submit(values) {
        if (this.props.policy.isPolicyUpdating) {
            return;
        }
        const name = values.name.trim();
        const outputCurrency = values.currency;
        Policy.updateGeneralSettings(this.props.policy.id, name, outputCurrency);
        Keyboard.dismiss();
    }

    validate(values) {
        const errors = {};
        if (!values.name || !values.name.trim().length) {
            errors.name = this.props.translate('workspace.editor.nameIsRequiredError');
        }
        return errors;
    }

    render() {
        const achState = lodashGet(this.props.reimbursementAccount, 'achData.state', '');
        const hasVBBA = achState === BankAccount.STATE.OPEN;
        const policyName = lodashGet(this.props.policy, 'name');
        const policyID = lodashGet(this.props.route, 'params.policyID');
        return (
            <FullPageNotFoundView shouldShow={_.isEmpty(this.props.policy)}>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.common.settings')}
                    subtitle={policyName}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_SETTINGS}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.getWorkspaceInitialRoute(policyID))}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    style={[styles.settingsPageBackground, styles.flex1, styles.w100]}
                >
                    <View style={[styles.w100, styles.flex1]}>
                        <Form
                            formID={ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM}
                            submitButtonText={this.props.translate('workspace.editor.save')}
                            style={[styles.mh5, styles.mt5, styles.flexGrow1]}
                            validate={this.validate}
                            onSubmit={this.submit}
                        >
                            <OfflineWithFeedback
                                pendingAction={lodashGet(this.props.policy, 'pendingFields.avatar', null)}
                                errors={lodashGet(this.props.policy, 'errorFields.avatar', null)}
                                onClose={() => Policy.clearAvatarErrors(this.props.policy.id)}
                            >
                                <AvatarWithImagePicker
                                    isUploading={this.props.policy.isAvatarUploading}
                                    avatarURL={lodashGet(this.props.policy, 'avatar')}
                                    size={CONST.AVATAR_SIZE.LARGE}
                                    DefaultAvatar={() => (
                                        <Icon
                                            src={Expensicons.Workspace}
                                            height={80}
                                            width={80}
                                            fill={defaultTheme.iconSuccessFill}
                                        />
                                    )}
                                    fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                                    style={[styles.mb3]}
                                    anchorPosition={{top: 172, right: 18}}
                                    isUsingDefaultAvatar={!lodashGet(this.props.policy, 'avatar', null)}
                                    onImageSelected={file => Policy.updateWorkspaceAvatar(lodashGet(this.props.policy, 'id', ''), file)}
                                    onImageRemoved={() => Policy.deleteWorkspaceAvatar(lodashGet(this.props.policy, 'id', ''))}
                                />
                            </OfflineWithFeedback>
                            <OfflineWithFeedback
                                pendingAction={lodashGet(this.props.policy, 'pendingFields.generalSettings')}
                            >
                                <TextInput
                                    inputID="name"
                                    label={this.props.translate('workspace.editor.nameInputLabel')}
                                    containerStyles={[styles.mt4]}
                                    defaultValue={this.props.policy.name}
                                />
                                <View style={[styles.mt4]}>
                                    <Picker
                                        inputID="currency"
                                        label={this.props.translate('workspace.editor.currencyInputLabel')}
                                        items={this.getCurrencyItems()}
                                        isDisabled={hasVBBA}
                                        defaultValue={this.props.policy.outputCurrency}
                                    />
                                </View>
                                <Text style={[styles.textLabel, styles.colorMuted, styles.mt2]}>
                                    {this.props.translate('workspace.editor.currencyInputHelpText')}
                                </Text>
                            </OfflineWithFeedback>
                        </Form>
                    </View>
                </ScrollView>
            </FullPageNotFoundView>
        );
    }
}

WorkspaceSettingsPage.propTypes = propTypes;
WorkspaceSettingsPage.defaultProps = defaultProps;

export default compose(
    withPolicy,
    withOnyx({
        currencyList: {
            key: ONYXKEYS.CURRENCY_LIST,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
    withLocalize,
    withNetwork(),
)(WorkspaceSettingsPage);
