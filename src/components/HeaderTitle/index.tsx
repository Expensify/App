import type {HeaderTitleProps} from './HeaderTitle';

import HeaderTitleComponent from './HeaderTitle';
import HeaderTitleSubtitle from './HeaderTitleSubtitle';
import HeaderTitleSubtitleLink from './HeaderTitleSubtitleLink';
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
