import React from 'react';
import {View, Text} from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import Logo from '../../../assets/images/expensify-cash.svg';
import TextInputWithLabel from '../../components/TextInputWithLabel';
import Button from '../../components/Button';

const propTypes = {
    ...withLocalizePropTypes,
};

class NewWorkspacePage extends React.Component {
    componentDidMount() {
        //
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
                    {/* TODO: replace this logo with the corresponding image from the design */}
                    <Logo height={100} />

                    <View style={[styles.mt4, styles.mb4, styles.newWorkspacePill]} />

                    <View style={[styles.w100, styles.flex1]}>
                        <TextInputWithLabel label={translate('workspace.new.chooseAName')} />
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
