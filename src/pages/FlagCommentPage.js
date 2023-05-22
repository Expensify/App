import React from 'react';
import {View} from 'react-native';
import withLocalize from '../components/withLocalize';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import styles from '../styles/styles';
import Navigation from '../libs/Navigation/Navigation';
import Text from '../components/Text';

function FlagCommentPage(props) {
    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
            <>
                <HeaderWithCloseButton
                    title={'Flag as Offensive'}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                    <View style={styles.pageWrapper}>
                        <View style={[styles.settingsPageBody, styles.alignItemsCenter]}>
                            <Text style={[styles.baseFontStyle]}>
                                {'Description of stuff lorem ipsum Description of stuff lorem ipsum Description of stuff lorem ipsum Description of stuff lorem ipsum Description of stuff lorem ipsum Description of stuff lorem ipsum Description of stuff lorem ipsum '}
                            </Text>
                        </View>
                    </View>
                <Text style={[styles.ph5, styles.textLabelSupporting, styles.mb1]}>
                    {'Choose Reason below'}
                </Text>
            </>)}
        </ScreenWrapper>
    );
}

FlagCommentPage.displayName = 'FlagCommentPage';

export default withLocalize(FlagCommentPage);

