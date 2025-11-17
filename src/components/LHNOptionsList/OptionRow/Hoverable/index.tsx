import React,{use} from 'react';
import Hoverable from '@components/Hoverable';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import usePressableInteractions from './hooks/usePressableInteractions';
import { OptionRowContext } from '../Provider';

type OptionRowLHNDataHoverableProps = {
    reportID: string;
    reportName: string;
    isUnread: boolean;
    alternateText: string;
    children: React.ReactNode;
    onSelectRow: (reportID: string) => void;
};

function OptionRowLHNDataHoverable({reportID, reportName, isUnread, alternateText, onSelectRow, children}: OptionRowLHNDataHoverableProps) {
    const {state: {isFocused}} = use(OptionRowContext);
    const {translate} = useLocalize();
    const {onMouseDown, onSecondaryInteraction} = usePressableInteractions();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    return (
        <Hoverable>
            {(hovered) => (
                <PressableWithSecondaryInteraction
                    role={CONST.ROLE.BUTTON}
                    onPress={() => onSelectRow(reportID)}
                    withoutFocusOnSecondaryInteraction
                    onMouseDown={onMouseDown}
                    onSecondaryInteraction={onSecondaryInteraction}
                    accessibilityLabel={`${translate('accessibilityHints.navigatesToChat')} ${reportName}. ${isUnread ? `${translate('common.unread')}.` : ''} ${alternateText}`}
                    style={[
                        styles.flexRow,
                        styles.alignItemsCenter,
                        styles.justifyContentBetween,
                        styles.sidebarLink,
                        styles.sidebarLinkInnerLHN,
                        StyleUtils.getBackgroundColorStyle(theme.sidebar),
                        isFocused ? styles.sidebarLinkActive : null,
                        hovered && !isFocused ? styles.sidebarLinkHover : null,
                    ]}
                >
                    {children}
                </PressableWithSecondaryInteraction>
            )}
        </Hoverable>
    );
}

export default OptionRowLHNDataHoverable;
