import HeaderTitleComponent from './HeaderTitle';
import HeaderTitleSubtitle from './HeaderTitleSubtitle';
import HeaderTitleSubtitleLink from './HeaderTitleSubtitleLink';

function HeaderTitleBase(props: React.ComponentProps<typeof HeaderTitleComponent>) {
    return <HeaderTitleComponent {...props} />;
}

const HeaderTitle = Object.assign(HeaderTitleBase, {
    Subtitle: HeaderTitleSubtitle,
    SubtitleLink: HeaderTitleSubtitleLink,
});

export default HeaderTitle;
