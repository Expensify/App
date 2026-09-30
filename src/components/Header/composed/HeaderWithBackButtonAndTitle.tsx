/**
 * Narrow preset over `<Header>` for the common back-button-plus-title case, so call-sites that need
 * nothing else don't have to compose the primitives by hand.
 */
import Header from '@components/Header/Header';
import HeaderRight from '@components/Header/layout/HeaderRight';
import HeaderBackButton from '@components/Header/primitives/HeaderBackButton';
import HeaderTitle from '@components/Header/primitives/HeaderTitle';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

type HeaderWithBackButtonAndTitleProps = Partial<ChildrenProps> & {
    title?: string;
    style?: StyleProp<ViewStyle>;
    titleStyles?: StyleProp<TextStyle>;
    onBackButtonPress?: () => void;

    /** Whether to use the taller headline style bar with the larger title font. */
    isHeadline?: boolean;
};

function HeaderWithBackButtonAndTitle({children, onBackButtonPress, isHeadline = false, title = '', titleStyles, style}: HeaderWithBackButtonAndTitleProps) {
    return (
        <Header style={style}>
            <HeaderBackButton onPress={onBackButtonPress} />
            <HeaderTitle
                title={title}
                titleStyles={titleStyles}
                isHeadline={isHeadline}
            />
            <HeaderRight>{children}</HeaderRight>
        </Header>
    );
}

export default HeaderWithBackButtonAndTitle;
