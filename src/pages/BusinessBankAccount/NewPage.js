import _ from 'underscore';
import React from 'react';
import {View, Text} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import MenuItem from '../../components/MenuItem';
import {Bug, Lock} from '../../components/Icon/Expensicons';
import styles from '../../styles/styles';
import TextLink from '../../components/TextLink';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import colors from '../../styles/colors';
import Navigation from '../../libs/Navigation/Navigation';
import Permissions from '../../libs/Permissions';

class BusinessBankAccountNewPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        if (!Permissions.canUseFreePlan()) {
            // This delay is necessary since the "navigator" object is not yet ready - probably we can move to a
            // 404 at some point, but not necessary right now.
            _.delay(Navigation.dismissModal, 0);
            return null;
        }

        return (
            <ScreenWrapper>
                <View style={[styles.flex1, styles.justifyContentBetween]}>
                    <HeaderWithCloseButton
                        title="Add Bank Account"
                        onCloseButtonPress={Navigation.dismissModal}
                    />
                    <View style={[styles.flex1]}>
                        <Text style={[styles.mh5, styles.mb5]}>
                            To get started with the Expensify Card, you first need to add a bank account.
                        </Text>
                        <MenuItem
                            icon={Bug}
                            title="Log Into Your Bank"
                            onPress={() => {
                                console.log('launching Plaid flow');
                            }}
                            shouldShowRightIcon
                        />
                        <MenuItem
                            icon={Bug}
                            title="Connect Manually"
                            onPress={() => {
                                console.log('connect manually');
                            }}
                            shouldShowRightIcon
                        />
                        <View style={[styles.m5, styles.flexRow, styles.justifyContentBetween]}>
                            <TextLink href="">
                                Privacy
                            </TextLink>
                            <TextLink href="" style={[styles.dFlex, styles.justifyContentCenter]}>
                                Your data is secure
                                <View style={[styles.ml1]}>
                                    <Icon src={Lock} fill={colors.blue} />
                                </View>
                            </TextLink>
                        </View>
                    </View>
                    <View style={[styles.m5]}>
                        <Button
                            success
                            text="Save & Continue"
                            onPress={() => {
                                console.log('lehgo');
                            }}
                        />
                    </View>
                </View>
            </ScreenWrapper>
        );
    }
}

export default BusinessBankAccountNewPage;
