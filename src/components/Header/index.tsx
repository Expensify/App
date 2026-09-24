/**
 * Header – composed counterpart of the legacy `HeaderWithBackButton`.
 *
 * Blocks are composed as children, left to right in this order:
 * - `Header.BackButton` (optional)
 * - `Header.Icon` (optional) — mutually exclusive with `Header.AvatarWithDisplayName`
 * - `Header.Title` or `Header.AvatarWithDisplayName` — pick one, not both
 * - `Header.Right`, wrapping the trailing zone:
 *   - `Header.Actions` for custom children and/or `Header.DownloadButton`
 *   - `Header.ThreeDotsMenu` (or a single `Header.IconButton` for a one-off action)
 *   - `Header.CloseButton`
 *
 * @example
 * ```tsx
 * import Header from '@components/Header';
 *
 * <Header>
 *   <Header.BackButton onPress={goBack} />
 *   <Header.Icon src={icon} />
 *   <Header.Title title={title} />
 *   <Header.Right>
 *     <Header.Actions>
 *       <ResetLink />
 *       <Header.DownloadButton onPress={onDownload} />
 *     </Header.Actions>
 *     <Header.ThreeDotsMenu items={menuItems} />
 *     <Header.CloseButton onPress={onClose} />
 *   </Header.Right>
 * </Header>
 * ```
 *
 * Report-header variant, swapping `Header.Title` for `Header.AvatarWithDisplayName` and
 * `Header.ThreeDotsMenu` for a single one-off `Header.IconButton`:
 * ```tsx
 * <Header>
 *   <Header.BackButton onPress={goBack} />
 *   <Header.AvatarWithDisplayName report={report} />
 *   <Header.Right>
 *     <Header.IconButton onPress={onPress} iconSrc={icon} tooltipText={text} />
 *   </Header.Right>
 * </Header>
 * ```
 */
import HeaderComponent from './Header';
import HeaderActions from './layout/HeaderActions';
import HeaderRight from './layout/HeaderRight';
import HeaderAvatarWithDisplayName from './primitives/HeaderAvatarWithDisplayName';
import HeaderBackButton from './primitives/HeaderBackButton';
import HeaderCloseButton from './primitives/HeaderCloseButton';
import HeaderDownloadButton from './primitives/HeaderDownloadButton';
import HeaderIcon from './primitives/HeaderIcon';
import HeaderIconButton from './primitives/HeaderIconButton';
import HeaderThreeDotsMenu from './primitives/HeaderThreeDotsMenu';
import HeaderTitle from './primitives/HeaderTitle';

function HeaderBase(props: React.ComponentProps<typeof HeaderComponent>) {
    return <HeaderComponent {...props} />;
}

const Header = Object.assign(HeaderBase, {
    Actions: HeaderActions,
    Right: HeaderRight,
    AvatarWithDisplayName: HeaderAvatarWithDisplayName,
    BackButton: HeaderBackButton,
    CloseButton: HeaderCloseButton,
    DownloadButton: HeaderDownloadButton,
    Icon: HeaderIcon,
    IconButton: HeaderIconButton,
    ThreeDotsMenu: HeaderThreeDotsMenu,
    Title: HeaderTitle,
});

export default Header;
