import React, {useRef} from 'react';
import {Pressable} from 'react-native';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import ROUTES from '../../../../ROUTES';
import Navigation from '../../../../libs/Navigation/Navigation';
import TextInput from '../../../../components/TextInput';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';

function ClearAfterPage() {
    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title="Clear after"
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS)}
            />
        </ScreenWrapper>
    );
}

ClearAfterPage.displayName = 'ClearAfterPage';

export default ClearAfterPage;
