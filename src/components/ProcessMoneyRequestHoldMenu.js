import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import Button from './Button';
import HoldMenuSectionList from './HoldMenuSectionList';
import Popover from './Popover';
import refPropTypes from './refPropTypes';
import Text from './Text';

const propTypes = {
    isVisible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    anchorPosition: PropTypes.shape({
        horizontal: PropTypes.number,
        vertical: PropTypes.number,
    }),
    anchorRef: refPropTypes,
};

const defaultProps = {
    anchorPosition: {},
    anchorRef: () => {},
};

function ProcessMoneyRequestHoldMenu({isVisible, onClose, onConfirm, anchorPosition, anchorRef}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <Popover
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            anchorRef={anchorRef}
        >
            <View style={[styles.mh5, styles.mv5]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb5]}>
                    <Text style={[styles.textHeadline, styles.mr2]}>{translate('iou.holdEducationalTitle')}</Text>
                    <Text style={[styles.holdRequestInline]}>{translate('iou.hold')}</Text>
                </View>
                <HoldMenuSectionList />
                <Button
                    success
                    style={[styles.mt5]}
                    text={translate('common.buttonConfirm')}
                    onPress={onConfirm}
                />
            </View>
        </Popover>
    );
}

ProcessMoneyRequestHoldMenu.propTypes = propTypes;
ProcessMoneyRequestHoldMenu.defaultProps = defaultProps;
ProcessMoneyRequestHoldMenu.displayName = 'ProcessMoneyRequestHoldMenu';

export default ProcessMoneyRequestHoldMenu;
