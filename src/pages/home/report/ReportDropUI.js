import React from 'react';
import {View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import DragAndDropIcon from '../../../../assets/images/drag-and-drop.svg';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import CONST from '../../../CONST';
import DropZone from '../../../components/DragAndDrop/DropZone';

const propTypes = {
    ...withLocalizePropTypes,
};

const ReportDropUI = props => (
    <DropZone hostName="ReportDropZone" dropZoneId={CONST.REPORT.ACTIVE_DROP_NATIVE_ID}>
        <View style={styles.mb3}>
            <DragAndDropIcon width={100} height={100} />
        </View>
        <Text style={styles.h1}>
            {props.translate('reportActionCompose.dropToUpload')}
        </Text>
    </DropZone>
);

ReportDropUI.displayName = 'ReportDropUI';
ReportDropUI.propTypes = propTypes;

export default withLocalize(ReportDropUI);
