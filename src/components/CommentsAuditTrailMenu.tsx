import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getClickedTargetLocation from '@libs/getClickedTargetLocation';
import {setShowAuditTrail} from '@userActions/AuditTrail';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import CaretWrapper from './CaretWrapper';
import type {PopoverMenuItem} from './PopoverMenu';
import PopoverMenu from './PopoverMenu';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';

function CommentsAuditTrailMenu() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const [showAuditTrail = true] = useOnyx(ONYXKEYS.SHOW_AUDIT_TRAIL);
    const [isVisible, setIsVisible] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({horizontal: 0, vertical: 0});
    const anchorRef = useRef(null);

    useEffect(() => {
        if (!anchorRef.current || !isVisible) {
            return;
        }

        const position = getClickedTargetLocation(anchorRef.current);
        const BOTTOM_MARGIN_OFFSET = 8;
        setAnchorPosition({horizontal: position.left, vertical: position.top + position.height + BOTTOM_MARGIN_OFFSET});
    }, [isVisible, windowWidth]);

    const label = showAuditTrail ? translate('reportDetailsPage.commentsAndHistory') : translate('reportDetailsPage.commentsOnly');

    const menuItems: PopoverMenuItem[] = [
        {
            text: translate('reportDetailsPage.commentsAndHistory'),
            isSelected: showAuditTrail,
            onSelected: () => setShowAuditTrail(true),
        },
        {
            text: translate('reportDetailsPage.commentsOnly'),
            isSelected: !showAuditTrail,
            onSelected: () => setShowAuditTrail(false),
        },
    ];

    return (
        <View style={[styles.ph5, styles.mb2]}>
            <View
                ref={anchorRef}
                style={styles.alignSelfStart}
            >
                <PressableWithFeedback
                    accessibilityLabel={label}
                    accessibilityRole={CONST.ROLE.BUTTON}
                    onPress={() => setIsVisible(true)}
                >
                    <CaretWrapper
                        caretWidth={12}
                        caretHeight={12}
                    >
                        <Text style={styles.textLabelSupporting}>{label}</Text>
                    </CaretWrapper>
                </PressableWithFeedback>
            </View>
            <PopoverMenu
                isVisible={isVisible}
                onClose={() => setIsVisible(false)}
                onItemSelected={() => setIsVisible(false)}
                anchorRef={anchorRef}
                anchorPosition={anchorPosition}
                anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                menuItems={menuItems}
                shouldShowRadioButton
            />
        </View>
    );
}

export default CommentsAuditTrailMenu;
