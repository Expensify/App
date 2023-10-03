import React from 'react';
import {View, Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {useRoute} from '@react-navigation/native';
import useLocalize from '../../../../../hooks/useLocalize';
import * as IOUUtils from '../../../../../libs/IOUUtils';
import FullPageNotFoundView from '../../../../../components/BlockingViews/FullPageNotFoundView';
import styles from '../../../../../styles/styles';
import HeaderWithBackButton from '../../../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../../../components/ScreenWrapper';
import IOURequestStepAmount from '../../step/IOURequestStepAmount';

const propTypes = {};

const defaultProps = {};

function IOURequestCreateTabManual() {
    const route = useRoute();

    return <IOURequestStepAmount route={route} />;
}

IOURequestCreateTabManual.propTypes = propTypes;
IOURequestCreateTabManual.defaultProps = defaultProps;
IOURequestCreateTabManual.displayName = 'IOURequestCreateTabManual';

export default withOnyx({})(IOURequestCreateTabManual);
