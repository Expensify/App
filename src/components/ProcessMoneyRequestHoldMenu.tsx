import React, {useEffect, useRef} from 'react';
import {Keyboard, View} from 'react-native';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import Button from './Button';
import HoldMenuSectionList from './HoldMenuSectionList';
import type {PopoverAnchorPosition} from './Modal/types';
import Popover from './Popover';
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
    anchorAlignment?: AnchorAlignment;
};

function ProcessMoneyRequestHoldMenu({isVisible, onClose, onConfirm, anchorPosition, anchorAlignment}: ProcessMoneyRequestHoldMenuProps) {
    const {translate} = useLocalize();
    const {isKeyboardShown} = useKeyboardState();
    const styles = useThemeStyles();
    const popoverRef = useRef(null);

    // This Popover modal doesn't have a field for user input, so dismiss the device keyboard if shown
    useEffect(() => {
        if (!isVisible || !isKeyboardShown) {
            return;
        }
        Keyboard.dismiss();
    }, [isVisible, isKeyboardShown]);

    return (
        <Popover
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            anchorRef={popoverRef}
            anchorAlignment={anchorAlignment}
            disableAnimation={false}
            withoutOverlay={false}
        >
            <View style={[styles.mh5, styles.mv5]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb5]}>
                    <Text style={[styles.textHeadline, styles.mr2]}>{translate('iou.holdEducationalTitle')}</Text>
                    <TextPill textStyles={styles.holdRequestInline}>{translate('violations.hold')}</TextPill>
                </View>
                <HoldMenuSectionList />
                <Button
                    success
                    style={[styles.mt5]}
                    text={translate('common.buttonConfirm')}
                    onPress={onConfirm}
                    large
                />
            </View>
        </Popover>
    );
}

ProcessMoneyRequestHoldMenu.displayName = 'ProcessMoneyRequestHoldMenu';

export default ProcessMoneyRequestHoldMenu;
