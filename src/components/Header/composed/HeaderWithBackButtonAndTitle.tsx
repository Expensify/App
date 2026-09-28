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

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress?: () => void;

    shouldUseHeadlineHeader?: boolean;

    /** The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'. */
    iconFill?: string;

    titleStyles?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;

    /** The URL link associated with the attachment's subtitle, if available */
    subTitleLink?: string;

    /** Whether to skip focus of the first interactive element inside the header after the RHP transition for screen reader announcement.  */
    shouldSkipFocusAfterTransition?: boolean;
};

function HeaderWithBackButtonAndTitle({
    children,
    iconFill,
    onBackButtonPress,
    shouldUseHeadlineHeader = false,
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
                iconFill={iconFill}
            />
            <HeaderTitle
                title={title}
                subtitle={subtitle}
                titleStyles={titleStyles}
                subTitleLink={subTitleLink}
                shouldUseHeadlineHeader={shouldUseHeadlineHeader}
            />
            <HeaderRight>{children}</HeaderRight>
        </Header>
    );
}

export default HeaderWithBackButtonAndTitle;
