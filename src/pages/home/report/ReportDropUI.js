import React from 'react';
import {View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import CONST from '../../../CONST';
import DropZone from '../../../components/DragAndDrop/DropZone';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';

const propTypes = {
    ...withLocalizePropTypes,
};

const ReportDropUI = props => (
    <DropZone dropZoneViewHolderName={CONST.REPORT.DROP_HOST_NAME} dropZoneId={CONST.REPORT.ACTIVE_DROP_NATIVE_ID}>
        <View style={styles.mb3}>
            <Icon src={Expensicons.DragAndDrop} width={100} height={100} />
        </View>
        <Text style={[styles.headlineFont, styles.textXLarge]}>
            {props.translate('reportActionCompose.dropToUpload')}
        </Text>
    </DropZone>
);

ReportDropUI.displayName = 'ReportDropUI';
ReportDropUI.propTypes = propTypes;

export default withLocalize(ReportDropUI);
