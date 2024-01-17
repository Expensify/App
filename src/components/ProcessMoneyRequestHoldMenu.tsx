import type {RefObject} from 'react';
import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Button from './Button';
import HoldMenuSectionList from './HoldMenuSectionList';
import type {PopoverAnchorPosition} from './Modal/types';
import Popover from './Popover';
import type {AnchorAlignment} from './Popover/types';
import Text from './Text';
import TextPill from './TextPill';

type ProcessMoneyRequestHoldMenuProps = {
    /** Whether the content is visible */
    isVisible: boolean;

    /** Method to trigger when pressing outside of the popover menu to close it */
    onClose: () => void;

    /** Method to trigger when pressing confirm button */
    onConfirm: () => void;

    /** The anchor position of the popover menu */
    anchorPosition?: PopoverAnchorPosition;

    /** The anchor alignment of the popover menu */
    anchorAlignment: AnchorAlignment;

    /** The anchor ref of the popover menu */
    anchorRef: RefObject<View | HTMLDivElement>;
};

function ProcessMoneyRequestHoldMenu({isVisible, onClose, onConfirm, anchorPosition, anchorAlignment, anchorRef}: ProcessMoneyRequestHoldMenuProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <Popover
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            anchorRef={anchorRef}
            anchorAlignment={anchorAlignment}
            disableAnimation={false}
            withoutOverlay={false}
        >
            <View style={[styles.mh5, styles.mv5]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb5]}>
                    <Text style={[styles.textHeadline, styles.mr2]}>{translate('iou.holdEducationalTitle')}</Text>
                    <TextPill textStyles={styles.holdRequestInline}>{translate('iou.hold')}</TextPill>;
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

ProcessMoneyRequestHoldMenu.displayName = 'ProcessMoneyRequestHoldMenu';

export default ProcessMoneyRequestHoldMenu;
