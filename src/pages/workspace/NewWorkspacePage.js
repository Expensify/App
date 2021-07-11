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
import Text from '../../components/Text';
import compose from '../../libs/compose';
import {create} from '../../libs/actions/Policy';
import defaultTheme from '../../styles/themes/default';


const propTypes = {
    /** List of betas */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...withLocalizePropTypes,
};
const defaultProps = {
    betas: [],
};

class NewWorkspacePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
        };

        this.submit = this.submit.bind(this);
    }

    submit() {
        const name = this.state.name.trim();
        create(name);
    }

    render() {
        if (!Permissions.canUseFreePlan(this.props.betas)) {
            console.debug('Not showing new workspace page because user is not on free plan beta');
            return <Navigation.DismissModal />;
        }

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.new.welcome')}
                    onCloseButtonPress={Navigation.dismissModal}
                />

                <View style={[styles.pageWrapper, styles.flex1]}>
                    <WorkspaceDefaultAvatar height={80} width={80} fill={defaultTheme.iconSuccessFill} />

                    <View style={[styles.mt6, styles.w100, styles.flex1]}>
                        <TextInputWithLabel
                            label={this.props.translate('workspace.new.chooseAName')}
                            value={this.state.name}
                            onChangeText={name => this.setState({name})}
                            onSubmitEditting={this.submit}
                        />
                        <Text style={[styles.mt6]}>{this.props.translate('workspace.new.helpText')}</Text>
                    </View>

                    <Button
                        success
                        style={[styles.w100]}
                        text={this.props.translate('workspace.new.getStarted')}
                        onPress={this.submit}
                        pressOnEnter
                    />
                </View>
            </ScreenWrapper>
        );
    }
}

NewWorkspacePage.propTypes = propTypes;
NewWorkspacePage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
    withLocalize,
)(NewWorkspacePage);
