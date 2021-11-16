import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import withFullPolicy, {fullPolicyDefaultProps, fullPolicyPropTypes} from './withFullPolicy';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ONYXKEYS from '../../CONST';
import compose from '../../libs/compose';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import styles from '../../styles/styles';
import TextInputWithLabel from '../../components/TextInputWithLabel';

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
        };
    }

    onSubmit() {

    }

    render() {
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
                        onChangeText={roomName => {
                            this.setState({roomName});
                        }}
                    />
                    {/*<ExpensiPicker*/}
                    {/*    label={this.props.translate('workspace.common.workspace')}*/}
                    {/*/>*/}
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
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
    }),
    withLocalize,
)(WorkspaceNewRoomPage);

