import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import * as Session from '@userActions/Session';
function ValidateAccountMessage () {

    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

}

export default ValidateAccountMessage;