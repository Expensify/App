/**
 * Narrow preset over `<Header>` for a Central Pane root screen of a Split Navigator
 * (Workspace/Settings/Domain). Every such screen shares the same shape: a headline title,
 * a back button shown only on narrow layout (the sidebar covers "back" on wide layout),
 * and the Side Panel (help) button. `shouldDisplaySearchRouter` is Settings-only.
 */
import Header from '@components/Header/Header';
import HeaderRight from '@components/Header/layout/HeaderRight';
import HeaderBackButton from '@components/Header/primitives/HeaderBackButton';
import HeaderTitle from '@components/Header/primitives/HeaderTitle';
import SidePanelButton from '@components/SidePanel/SidePanelButton';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

type HeaderCentralPaneProps = Partial<ChildrenProps> & {
    title: string;
    onBackButtonPress?: () => void;

    /** Whether to use the taller headline style bar with the larger title font. Screens that swap the title for a "select multiple" prompt in selection mode turn this off while selecting. */
    isHeadline?: boolean;
};

function HeaderCentralPane({title, onBackButtonPress, isHeadline = true, children}: HeaderCentralPaneProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    return (
        <Header>
            {shouldUseNarrowLayout && <HeaderBackButton onPress={onBackButtonPress} />}
            <HeaderTitle
                title={title}
                titleStyles={isHeadline && styles.textHeadlineH2}
            />
            <HeaderRight>
                {children}
                <SidePanelButton />
            </HeaderRight>
        </Header>
    );
}

export default HeaderCentralPane;
