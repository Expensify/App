import type TabBarBottomContentProps from '@components/Navigation/TabBarBottomContent/types';
import type {ScreenWrapperContainerProps} from '@components/ScreenWrapper/ScreenWrapperContainer';

type TabRootScreenWrapperProps = Pick<ScreenWrapperContainerProps, 'bottomContent' | 'bottomContentStyle' | 'includeSafeAreaPaddingBottom'>;

type UseTabRootScreenWrapperProps = (selectedTab: TabBarBottomContentProps['selectedTab']) => TabRootScreenWrapperProps;

export default UseTabRootScreenWrapperProps;
