import HeaderComponent from './Header';
/**
 * Header – a new Header built with composition API.
 *
 * Instead of a large flat props list (title, icon, shouldShowBackButton, …),
 * sub-components are composed as children:
 *
 * @example
 * ```tsx
 * import Header from '@components/HeaderWithBackButtonComposed';
 *
 * <Header shouldUseHeadlineHeader>
 *   <Header.BackButton onPress={goBack} />
 *   <Header.Title>Settings</Header.Title>
 *   <Header.Right>
 *     <Header.Actions>
 *       <Header.DownloadButton onPress={onDownload} />
 *     </Header.Actions>
 *   </Header.Right>
 * </Header>
 * ```
 *
 * The old `HeaderWithBackButton` component is not affected – migration can be gradual.
 */
import HeaderBackButton from './primitives/HeaderBackButton';
import HeaderCloseButtonTooltip from './primitives/HeaderCloseButtonTooltip';
import HeaderDownloadButton from './primitives/HeaderDownloadButton';
import HeaderIcon from './primitives/HeaderIcon';
import HeaderMenuItemButtonTooltip from './primitives/HeaderMenuItemButtonTooltip';
import HeaderThreeDotsMenu from './primitives/HeaderThreeDotsMenu';
import HeaderTitle from './primitives/HeaderTitle';
import HeaderActions from './zones/HeaderActions';
import HeaderRight from './zones/HeaderRight';

const Header = Object.assign(HeaderComponent, {
    BackButton: HeaderBackButton,
    Icon: HeaderIcon,
    Title: HeaderTitle,
    CloseButtonTooltip: HeaderCloseButtonTooltip,
    DownloadButton: HeaderDownloadButton,
    ThreeDotsMenu: HeaderThreeDotsMenu,
    MenuItemButtonTooltip: HeaderMenuItemButtonTooltip,
    Right: HeaderRight,
    Actions: HeaderActions,
});

export default Header;
