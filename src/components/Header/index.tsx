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
