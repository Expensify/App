import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import Permissions from '../../libs/Permissions';
import styles from '../../styles/styles';
import TextInputWithLabel from '../../components/TextInputWithLabel';
import Button from '../../components/Button';
import Text from '../../components/Text';
import compose from '../../libs/compose';
import {
    uploadAvatar, update, updateLocalPolicyValues,
} from '../../libs/actions/Policy';
import Icon from '../../components/Icon';
import {Workspace} from '../../components/Icon/Expensicons';
import AvatarWithImagePicker from '../../components/AvatarWithImagePicker';
import defaultTheme from '../../styles/themes/default';
import Growl from '../../libs/Growl';
import CONST from '../../CONST';

const propTypes = {
    /** List of betas */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...withLocalizePropTypes,
};
const defaultProps = {
    betas: [],
};

class WorkspaceEditorPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: props.policy.name,
            avatarURL: props.policy.avatarURL,
            previewAvatarURL: props.policy.avatarURL,
        };

        this.submit = this.submit.bind(this);
        this.onImageSelected = this.onImageSelected.bind(this);
        this.onImageRemoved = this.onImageRemoved.bind(this);
        this.uploadAvatarPromise = Promise.resolve();
    }

    onImageSelected(image) {
        updateLocalPolicyValues(this.props.policy.id, {isAvatarUploading: true});
        this.setState({previewAvatarURL: image.uri});

        // Store the upload avatar promise so we can wait for it to finish before updating the policy
        this.uploadAvatarPromise = uploadAvatar(image).then(url => new Promise((resolve) => {
            this.setState({avatarURL: url}, resolve);
        })).catch(() => {
            Growl.error(this.props.translate('workspace.editor.avatarUploadFailureMessage'));
        }).finally(() => updateLocalPolicyValues(this.props.policy.id, {isAvatarUploading: false}));
    }

    onImageRemoved() {
        this.setState({previewAvatarURL: '', avatarURL: ''});
    }

    submit() {
        updateLocalPolicyValues(this.props.policy.id, {isPolicyUpdating: true});

        // Wait for the upload avatar promise to finish before updating the policy
        this.uploadAvatarPromise.then(() => {
            const name = this.state.name.trim();
            const avatarURL = this.state.avatarURL;
            const policyID = this.props.policy.id;

            update(policyID, {name, avatarURL});
        }).catch(() => {
            updateLocalPolicyValues(this.props.policy.id, {isPolicyUpdating: false});
        });
    }

    render() {
        const {policy} = this.props;

        if (!Permissions.canUseFreePlan(this.props.betas)) {
            console.debug('Not showing workspace editor page because user is not on free plan beta');
            return <Navigation.DismissModal />;
        }

        if (_.isEmpty(policy)) {
            return null;
        }

        const isButtonDisabled = policy.isAvatarUploading
                                  || (this.state.avatarURL === this.props.policy.avatarURL
                                    && this.state.name === this.props.policy.name);
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.editor.title')}
                    onCloseButtonPress={Navigation.dismissModal}
                />

                <View style={[styles.pageWrapper, styles.flex1, styles.pRelative]}>
                    <View style={[styles.w100, styles.flex1]}>
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
                            onImageSelected={this.onImageSelected}
                            onImageRemoved={this.onImageRemoved}
                        />

                        <TextInputWithLabel
                            label={this.props.translate('workspace.editor.nameInputLabel')}
                            value={this.state.name}
                            onChangeText={name => this.setState({name})}
                            onSubmitEditting={this.submit}
                        />
                        <Text style={[styles.mt2, styles.formHint]}>
                            {this.props.translate('workspace.editor.nameInputHelpText')}
                        </Text>
                    </View>

                    <Button
                        success
                        isLoading={policy.isPolicyUpdating}
                        isDisabled={isButtonDisabled}
                        style={[styles.w100]}
                        text={this.props.translate('workspace.editor.save')}
                        onPress={this.submit}
                        pressOnEnter
                    />
                </View>
            </ScreenWrapper>
        );
    }
}

WorkspaceEditorPage.propTypes = propTypes;
WorkspaceEditorPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        policy: {
            key: (props) => {
                const routes = lodashGet(props.navigation.getState(), 'routes', []);
                const routeWithPolicyIDParam = _.find(routes, route => route.params && route.params.policyID);
                const policyID = lodashGet(routeWithPolicyIDParam, ['params', 'policyID']);
                return `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
            },
        },
    }),
    withLocalize,
)(WorkspaceEditorPage);
