import React, {Component} from 'react';
import {View, ScrollView} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import KeyboardAvoidingView from '../components/KeyboardAvoidingView';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import styles from '../styles/styles';
import Text from '../components/Text';
import RequestCallIcon from '../../assets/images/request-call.svg';

class GetAssistancePage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={"Get assistance"}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.goBack()}
                    />
                    <ScrollView style={styles.flex1} contentContainerStyle={[styles.p5, styles.pt0]}>
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <Text style={[styles.h1, styles.flex1]}>{"this is a subtitle"}</Text>
                            <RequestCallIcon width={160} height={100} style={styles.flex1} />
                        </View>
                        <Text style={[styles.mb4]}>
                            {"blah blah blah"}
                        </Text>
                    </ScrollView>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

export default GetAssistancePage;
