import type {HeaderTitleProps} from '@components/HeaderTitle/HeaderTitle';
import HeaderTitleComponent from '@components/HeaderTitle/HeaderTitle';
import HeaderTitleSubtitleLink from '@components/HeaderTitle/HeaderTitleSubtitleLink';

import HeaderTitleSubtitle from './HeaderTitleSubtitle';
import HeaderTitleText from './HeaderTitleText';

function HeaderTitleBase(props: HeaderTitleProps) {
    return <HeaderTitleComponent {...props} />;
}

const HeaderTitle = Object.assign(HeaderTitleBase, {
    Text: HeaderTitleText,
    Subtitle: HeaderTitleSubtitle,
    SubtitleLink: HeaderTitleSubtitleLink,
});

export default HeaderTitle;
