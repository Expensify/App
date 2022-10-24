import React from 'react';
import {createPortal} from 'react-dom';
import {View} from 'react-native';
import CONST from '../../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import DragAndDropIcon from '../../../../assets/images/drag-and-drop.svg';
import styles from '../../../styles/styles';
import theme from '../../../styles/themes/default';
import Text from '../../../components/Text';

const propTypes = {
    ...withLocalizePropTypes,
};

const DropZone = ({children}) => createPortal(
    children,
    document.getElementById(CONST.REPORT.DROP_NATIVE_ID),
);

const ReportDropUI = props => (
    <DropZone>
        <View style={[{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.dragAndDropBackground,
            opacity: 0.96,
            zIndex: 2,
        }, styles.alignItemsCenter, styles.justifyContentCenter]}
        >
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <View style={[styles.mb3]}>
                    <DragAndDropIcon width={100} height={100} />
                </View>
                <Text numberOfLines={2} style={[styles.h1]}>
                    {props.translate('reportActionCompose.dropToUpload')}
                </Text>
            </View>
        </View>
    </DropZone>
);

ReportDropUI.displayName = 'ReportDropUI';
ReportDropUI.propTypes = propTypes;

export default withLocalize(ReportDropUI);
