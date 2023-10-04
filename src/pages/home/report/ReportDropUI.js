import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import DragAndDropConsumer from '../../../components/DragAndDrop/Consumer';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';
import useLocalize from '../../../hooks/useLocalize';

const propTypes = {
    /** Callback to execute when a file is dropped. */
    onDrop: PropTypes.func.isRequired,
};

function ReportDropUI({onDrop}) {
    const {translate} = useLocalize();
    return (
        <DragAndDropConsumer onDrop={onDrop}>
            <View style={[styles.reportDropOverlay, styles.w100, styles.h100, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <View style={styles.mb3}>
                    <Icon
                        src={Expensicons.DragAndDrop}
                        width={100}
                        height={100}
                    />
                </View>
                <Text style={[styles.textHeadline]}>{translate('reportActionCompose.dropToUpload')}</Text>
            </View>
        </DragAndDropConsumer>
    );
}

ReportDropUI.displayName = 'ReportDropUI';
ReportDropUI.propTypes = propTypes;

export default ReportDropUI;
