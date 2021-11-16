import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import withFullPolicy, {fullPolicyDefaultProps, fullPolicyPropTypes} from './withFullPolicy';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import styles from '../../styles/styles';
import TextInputWithLabel from '../../components/TextInputWithLabel';
import ExpensiPicker from '../../components/ExpensiPicker';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';

const propTypes = {
    ...fullPolicyPropTypes,

    ...withLocalizePropTypes,
};
const defaultProps = {
    betas: [],
    ...fullPolicyDefaultProps,
};

class WorkspaceNewRoomPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            roomName: '',
            policyID: '',
            visibility: CONST.REPORT.VISIBILITY.RESTRICTED,
        };
        this.workspaceOptions = [];
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        this.workspaceOptions = _.map(this.props.policies, policy => ({label: policy.name, key: policy.id, value: policy.id}));
    }

    onSubmit() {

    }

    render() {
        const selectedWorkspaceName = this.state.policyID
            ? this.props.policies[`${ONYXKEYS.COLLECTION.POLICY}${this.state.policyID}`].name
            : '';
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('newRoomPage.newRoom')}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <View style={[styles.flex1, styles.w100, styles.pRelative, styles.p5]}>
                    <TextInputWithLabel
                        label={this.props.translate('newRoomPage.roomName')}
                        prefixCharacter="#"
                        placeholder={this.props.translate('newRoomPage.social')}
                        containerStyles={[styles.mb5]}
                        onChangeText={roomName => this.setState({roomName})}
                    />
                    <ExpensiPicker
                        value={selectedWorkspaceName}
                        label={this.props.translate('workspace.common.workspace')}
                        placeholder={{value: '', label: this.props.translate('newRoomPage.selectAWorkspace')}}
                        items={this.workspaceOptions}
                        onChange={policyID => this.setState({policyID})}
                    />
                </View>

            </ScreenWrapper>
        );
    }
}

WorkspaceNewRoomPage.propTypes = propTypes;
WorkspaceNewRoomPage.defaultProps = defaultProps;

export default compose(
    withFullPolicy,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    }),
    withLocalize,
)(WorkspaceNewRoomPage);
