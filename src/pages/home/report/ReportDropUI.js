import React from 'react';
import {View} from 'react-native';
import {Portal} from '@gorhom/portal';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import DragAndDropIcon from '../../../../assets/images/drag-and-drop.svg';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';

const propTypes = {
    ...withLocalizePropTypes,
};

const ReportDropUI = props => (
    <Portal hostName="DropZone">
        <View style={[styles.fullScreenTransparentOverlay, styles.alignItemsCenter, styles.justifyContentCenter]}>
            <View style={styles.mb3}>
                <DragAndDropIcon width={100} height={100} />
            </View>
            <Text style={styles.h1}>
                {props.translate('reportActionCompose.dropToUpload')}
            </Text>
        </View>
    </Portal>
);

ReportDropUI.displayName = 'ReportDropUI';
ReportDropUI.propTypes = propTypes;

export default withLocalize(ReportDropUI);
