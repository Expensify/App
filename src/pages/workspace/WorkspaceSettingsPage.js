import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import Permissions from '../../libs/Permissions';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import Text from '../../components/Text';
import compose from '../../libs/compose';
import * as Policy from '../../libs/actions/Policy';
import Icon from '../../components/Icon';
import {Workspace} from '../../components/Icon/Expensicons';
import AvatarWithImagePicker from '../../components/AvatarWithImagePicker';
import defaultTheme from '../../styles/themes/default';
import Growl from '../../libs/Growl';
import CONST from '../../CONST';
import ExpensiPicker from '../../components/ExpensiPicker';
import {getCurrencyList} from '../../libs/actions/PersonalDetails';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import FixedFooter from '../../components/FixedFooter';
import WorkspacePageWithSections from './WorkspacePageWithSections';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';

const propTypes = {
    /** List of betas */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Policy for the current route */
    policy: PropTypes.shape({
        /** ID of the policy */
        id: PropTypes.string,

        /** Name of the policy */
        name: PropTypes.string.isRequired,

        /** Avatar of the policy */
        avatarURL: PropTypes.string.isRequired,

        /** Currency of the policy */
        outputCurrency: PropTypes.string.isRequired,
    }).isRequired,

    ...withLocalizePropTypes,
};
const defaultProps = {
    betas: [],
};

class WorkspaceSettingsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: props.policy.name,
            avatarURL: props.policy.avatarURL,
            previewAvatarURL: props.policy.avatarURL,
            currency: props.policy.outputCurrency,
        };

        this.submit = this.submit.bind(this);
        this.uploadAvatar = this.uploadAvatar.bind(this);
        this.removeAvatar = this.removeAvatar.bind(this);
        this.getCurrencyItems = this.getCurrencyItems.bind(this);
        this.uploadAvatarPromise = Promise.resolve();
    }

    componentDidMount() {
        getCurrencyList();
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

    removeAvatar() {
        this.setState({previewAvatarURL: '', avatarURL: ''});
    }

    /**
     * @param {Object} image
     * @param {String} image.uri
     */
    uploadAvatar(image) {
        Policy.updateLocalPolicyValues(this.props.policy.id, {isAvatarUploading: true});
        this.setState({previewAvatarURL: image.uri});

        // Store the upload avatar promise so we can wait for it to finish before updating the policy
        this.uploadAvatarPromise = Policy.uploadAvatar(image).then(url => new Promise((resolve) => {
            this.setState({avatarURL: url}, resolve);
        })).catch(() => {
            Growl.error(this.props.translate('workspace.editor.avatarUploadFailureMessage'));
        }).finally(() => Policy.updateLocalPolicyValues(this.props.policy.id, {isAvatarUploading: false}));
    }

    submit() {
        if (this.props.policy.isAvatarUploading) {
            return;
        }
        const name = this.state.name.trim();
        const avatarURL = this.state.avatarURL;
        const outputCurrency = this.state.currency;
        Policy.updateLocalPolicyValues(this.props.policy.id, {name, avatarURL, outputCurrency});

        // Wait for the upload avatar promise to finish before updating the policy
        this.uploadAvatarPromise.then(() => {
            Policy.update(this.props.policy.id, {name, avatarURL, outputCurrency});
        });
        Growl.success(this.props.translate('workspace.common.growlMessageOnSave'));
    }

    render() {
        const {policy} = this.props;

        if (!Permissions.canUseFreePlan(this.props.betas)) {
            console.debug('Not showing workspace editor page because user is not on free plan beta');
            return <Navigation.DismissModal />;
        }

        if (_.isEmpty(policy)) {
            return <FullScreenLoadingIndicator />;
        }

        return (
            <WorkspacePageWithSections
                headerText={this.props.translate('workspace.common.settings')}
                route={this.props.route}
                footer={(
                    <FixedFooter style={[styles.w100]}>
                        <Button
                            success
                            isLoading={policy.isPolicyUpdating}
                            text={this.props.translate('workspace.editor.save')}
                            onPress={this.submit}
                            pressOnEnter
                        />
                    </FixedFooter>
                )}
            >
                {hasVBA => (
                    <View style={[styles.pageWrapper, styles.flex1, styles.alignItemsStretch]}>
                        <AvatarWithImagePicker
                            isUploading={policy.isAvatarUploading}
                            avatarURL={this.state.previewAvatarURL}
                            size={CONST.AVATAR_SIZE.LARGE}
                            DefaultAvatar={() => (
                                <Icon
                                    src={Workspace}
                                    height={80}
                                    width={80}
                                    fill={defaultTheme.iconSuccessFill}
                                />
                            )}
                            style={[styles.mb3]}
                            anchorPosition={{top: 172, right: 18}}
                            isUsingDefaultAvatar={!this.state.previewAvatarURL}
                            onImageSelected={this.uploadAvatar}
                            onImageRemoved={this.removeAvatar}
                        />

                        <ExpensiTextInput
                            label={this.props.translate('workspace.editor.nameInputLabel')}
                            containerStyles={[styles.mt4]}
                            onChangeText={name => this.setState({name})}
                            value={this.state.name}
                            hasError={!this.state.name.trim().length}
                            errorText={this.state.name.trim().length ? '' : this.props.translate('workspace.editor.nameIsRequiredError')}
                        />

                        <View style={[styles.mt4]}>
                            <ExpensiPicker
                                label={this.props.translate('workspace.editor.currencyInputLabel')}
                                onChange={currency => this.setState({currency})}
                                items={this.getCurrencyItems()}
                                value={this.state.currency}
                                isDisabled={hasVBA}
                            />
                        </View>
                        <Text style={[styles.textLabel, styles.colorMuted, styles.mt2]}>
                            {this.props.translate('workspace.editor.currencyInputHelpText')}
                        </Text>
                    </View>
                )}
            </WorkspacePageWithSections>
        );
    }
}

WorkspaceSettingsPage.propTypes = propTypes;
WorkspaceSettingsPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        policy: {
            key: (props) => {
                const policyID = lodashGet(props, 'route.params.policyID', '');
                return `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
            },
        },
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
    }),
    withLocalize,
)(WorkspaceSettingsPage);
