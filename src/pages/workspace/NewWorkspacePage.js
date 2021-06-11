import React from 'react';
import {View, Text} from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import WorkspaceDefaultAvatar from '../../../assets/images/workspace-default-avatar.svg';
import TextInputWithLabel from '../../components/TextInputWithLabel';
import Button from '../../components/Button';
import AttachmentPicker from '../../components/AttachmentPicker';
import Icon from '../../components/Icon';
import {DownArrow, Upload} from '../../components/Icon/Expensicons';
import CreateMenu from '../../components/CreateMenu';

const propTypes = {
    ...withLocalizePropTypes,
};

class NewWorkspacePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isEditPhotoMenuVisible: false,
            name: '',
        };

        this.createMenuItems = this.createMenuItems.bind(this);
    }

    /**
     * Create menu items list for avatar menu
     *
     * @param {Function} openPicker
     * @returns {Array}
     */
    createMenuItems(openPicker) {
        const menuItems = [
            {
                icon: Upload,
                text: this.props.translate('workspace.new.uploadPhoto'),
                onSelected: () => {
                    openPicker({
                        onPicked: () => {
                            // TODO: connect with setWorkspaceAvatar function
                        },
                    });
                },
            },
        ];

        // TODO: Add option to remove avatar if the user doesn't like the one they chose.

        return menuItems;
    }

    render() {
        const {translate} = this.props;

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={translate('workspace.new.welcome')}
                    onCloseButtonPress={Navigation.dismissModal}
                />

                <View style={[styles.pageWrapper, styles.flex1]}>
                    {/* TODO: replace this with the Avatar component once we connect it with the backend */}
                    <WorkspaceDefaultAvatar height={100} width={100} />

                    <AttachmentPicker>
                        {({openPicker}) => (
                            <>
                                <Button
                                    style={[styles.alignSelfCenter, styles.mt3]}
                                    onPress={() => this.setState({isEditPhotoMenuVisible: true})}
                                    ContentComponent={() => (
                                        <View style={[styles.flexRow]}>
                                            <Icon src={DownArrow} />
                                            <View style={styles.justifyContentCenter}>
                                                <Text style={[styles.headerText, styles.ml2]}>
                                                    {translate('workspace.new.editPhoto')}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                />
                                <CreateMenu
                                    isVisible={this.state.isEditPhotoMenuVisible}
                                    onClose={() => this.setState({isEditPhotoMenuVisible: false})}
                                    onItemSelected={() => this.setState({isEditPhotoMenuVisible: false})}
                                    menuItems={this.createMenuItems(openPicker)}
                                    anchorPosition={styles.createMenuPositionProfile}
                                    animationIn="fadeInRight"
                                    animationOut="fadeOutRight"
                                />
                            </>
                        )}
                    </AttachmentPicker>

                    <View style={[styles.mt6, styles.w100, styles.flex1]}>
                        <TextInputWithLabel
                            label={translate('workspace.new.chooseAName')}
                            value={this.state.name}
                            onChangeText={name => this.setState({name})}
                        />
                        <Text style={[styles.mt6, styles.textP]}>{translate('workspace.new.chooseANameHint')}</Text>
                    </View>

                    <Button success style={[styles.w100]} text={this.props.translate('workspace.new.getStarted')} />
                </View>
            </ScreenWrapper>
        );
    }
}

NewWorkspacePage.propTypes = propTypes;
NewWorkspacePage.displayName = 'NewWorkspacePage';

export default withLocalize(NewWorkspacePage);
