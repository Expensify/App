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
import Popover from './Popover';
import {PressableWithFeedback} from './Pressable';
import Switch from './Switch';
import Text from './Text';

function CommentsAuditTrailMenu() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const [showAuditTrail = true] = useOnyx(ONYXKEYS.SHOW_AUDIT_TRAIL);
    const [isVisible, setIsVisible] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({top: 0, left: 0});
    const anchorRef = useRef(null);

    useEffect(() => {
        if (!anchorRef.current || !isVisible) {
            return;
        }

        const position = getClickedTargetLocation(anchorRef.current);
        const BOTTOM_MARGIN_OFFSET = 3;
        setAnchorPosition({top: position.top + position.height + BOTTOM_MARGIN_OFFSET, left: position.left});
    }, [isVisible, windowWidth]);

    return (
        <View style={[styles.ph5, styles.mb2]}>
            <View
                ref={anchorRef}
                style={styles.alignSelfStart}
            >
                <PressableWithFeedback
                    accessibilityLabel={translate('common.comments')}
                    accessibilityRole={CONST.ROLE.BUTTON}
                    onPress={() => setIsVisible(true)}
                >
                    <CaretWrapper
                        caretWidth={12}
                        caretHeight={12}
                    >
                        <Text style={styles.textLabelSupporting}>{translate('common.comments')}</Text>
                    </CaretWrapper>
                </PressableWithFeedback>
            </View>
            <Popover
                onClose={() => setIsVisible(false)}
                isVisible={isVisible}
                anchorRef={anchorRef}
                anchorPosition={anchorPosition}
            >
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.gap4, styles.p4]}>
                    <Text style={styles.textLabelSupporting}>{translate('reportDetailsPage.showAuditTrail')}</Text>
                    <Switch
                        isOn={showAuditTrail}
                        accessibilityLabel={translate('reportDetailsPage.showAuditTrail')}
                        onToggle={setShowAuditTrail}
                    />
                </View>
            </Popover>
        </View>
    );
}

export default CommentsAuditTrailMenu;
