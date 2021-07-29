import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import ONYXKEYS from '../../ONYXKEYS';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import Permissions from '../../libs/Permissions';
import styles from '../../styles/styles';
import WorkspaceDefaultAvatar from '../../../assets/images/workspace-default-avatar.svg';
import TextInputWithLabel from '../../components/TextInputWithLabel';
import Button from '../../components/Button';
import compose from '../../libs/compose';
import {setName, setAvatarURL, updateAvatar} from '../../libs/actions/Policy';
import defaultTheme from '../../styles/themes/default';
import AvatarWithImagePicker from '../../components/AvatarWithImagePicker';

const propTypes = {
    /** List of betas */
    betas: PropTypes.arrayOf(PropTypes.string),
    ...withLocalizePropTypes,

    /** Policy being edited */
    policy: PropTypes.shape({
        /** ID of the policy */
        id: PropTypes.string,

        /** Name of the policy */
        name: PropTypes.string,

        /** Avatar url of the policy */
        avatarURL: PropTypes.string,
    }).isRequired,

    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** policyID passed via route: /workspace/:policyID/edit */
            policyID: PropTypes.string,
        }),
    }).isRequired,
};
const defaultProps = {
    betas: [],
};

class EditWorkspacePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: props.policy.name,
        };

        this.submit = this.submit.bind(this);
    }

    submit() {
        const name = this.state.name.trim();
        setName(this.props.policy.id, name);
    }

    render() {
        if (!Permissions.canUseFreePlan(this.props.betas)) {
            console.debug('Not showing new workspace page because user is not on free plan beta');
            return <Navigation.DismissModal />;
        }

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.edit.editWorkspace')}
                    onCloseButtonPress={Navigation.dismissModal}
                />

                <View style={[styles.pageWrapper, styles.flex1]}>
                    <AvatarWithImagePicker
                        avatarURL={this.props.policy.avatarURL}
                        DefaultAvatar={() => <WorkspaceDefaultAvatar height={80} width={80} fill={defaultTheme.icon} />}
                        anchorPosition={{top: 176, right: 20}}
                        isUsingDefaultAvatar={!this.props.policy.avatarURL}
                        onImageSelected={(image) => {
                            updateAvatar(this.props.policy.id, image);
                        }}
                        onImageRemoved={() => setAvatarURL(this.props.policy.id)}
                    />

                    <View style={[styles.mt6, styles.w100, styles.flex1]}>
                        <TextInputWithLabel
                            label={this.props.translate('workspace.new.chooseAName')}
                            value={this.state.name}
                            onChangeText={name => this.setState({name})}
                            onSubmitEditting={this.submit}
                        />
                    </View>

                    <Button
                        success
                        style={[styles.w100]}
                        text={this.props.translate('common.save')}
                        onPress={this.submit}
                        pressOnEnter
                        isDisabled={!this.state.name}
                    />
                </View>
            </ScreenWrapper>
        );
    }
}

EditWorkspacePage.propTypes = propTypes;
EditWorkspacePage.defaultProps = defaultProps;
EditWorkspacePage.displayName = 'EditWorkspacePage';

export default compose(
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        policy: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`,
        },
    }),
    withLocalize,
)(EditWorkspacePage);
