/**
 * Narrow preset over `<Header>` for a Central Pane root screen of a Split Navigator
 * (Workspace/Settings/Domain). Every such screen shares the same shape: a headline title,
 * a back button shown only on narrow layout (the sidebar covers "back" on wide layout),
 * and the Side Panel (help) button. Some account settings pages also use `displaySearchRouter`.
 */
import Header from '@components/Header/Header';
import HeaderActions from '@components/Header/layout/HeaderActions';
import HeaderRight from '@components/Header/layout/HeaderRight';
import HeaderBackButton from '@components/Header/primitives/HeaderBackButton';
import HeaderTitle from '@components/Header/primitives/HeaderTitle';
import SearchButton from '@components/Search/SearchRouter/SearchButton';
import SidePanelButton from '@components/SidePanel/SidePanelButton';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

type HeaderCentralPaneProps = Partial<ChildrenProps> & {
    title: string;
    onBackButtonPress?: () => void;

    /** Whether to use the taller headline style bar with the larger title font. Screens that swap the title for a "select multiple" prompt in selection mode turn this off while selecting. */
    isHeadline?: boolean;

    /** Whether to display the SearchRouter button. */
    displaySearchRouter?: boolean;
};

function HeaderCentralPane({title, onBackButtonPress, isHeadline = true, displaySearchRouter = false, children}: HeaderCentralPaneProps) {
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
                <HeaderActions>{children}</HeaderActions>
            </HeaderRight>
            {displaySearchRouter && <SearchButton />}
            <SidePanelButton />
        </Header>
    );
}

export default HeaderCentralPane;
