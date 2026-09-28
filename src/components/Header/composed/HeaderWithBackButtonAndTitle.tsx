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
    subtitle?: string;
    subTitleLink?: string;
    style?: StyleProp<ViewStyle>;
    titleStyles?: StyleProp<TextStyle>;
    onBackButtonPress?: () => void;

    /** Whether to use the taller headline style bar with the larger title font. */
    isHeadline?: boolean;

    /** The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'. */
    backIconFill?: string;

    /** Whether to skip focus of the first interactive element inside the header after the RHP transition for screen reader announcement.  */
    shouldSkipFocusAfterTransition?: boolean;
};

function HeaderWithBackButtonAndTitle({
    children,
    backIconFill,
    onBackButtonPress,
    isHeadline = false,
    subtitle = '',
    title = '',
    titleStyles,
    style,
    subTitleLink = '',
    shouldSkipFocusAfterTransition = false,
}: HeaderWithBackButtonAndTitleProps) {
    return (
        <Header
            style={style}
            shouldSkipFocusAfterTransition={shouldSkipFocusAfterTransition}
        >
            <HeaderBackButton
                onPress={onBackButtonPress}
                iconFill={backIconFill}
            />
            <HeaderTitle
                title={title}
                subtitle={subtitle}
                titleStyles={titleStyles}
                subTitleLink={subTitleLink}
                isHeadline={isHeadline}
            />
            <HeaderRight>{children}</HeaderRight>
        </Header>
    );
}

export default HeaderWithBackButtonAndTitle;
