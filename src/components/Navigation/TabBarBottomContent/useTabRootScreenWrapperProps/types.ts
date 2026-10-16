import type {ScreenWrapperContainerProps} from '@components/ScreenWrapper/ScreenWrapperContainer';
import type {ScreenWrapperOfflineIndicatorsProps} from '@components/ScreenWrapper/ScreenWrapperOfflineIndicators';

type TabRootScreenWrapperProps = Pick<ScreenWrapperContainerProps, 'bottomContent' | 'bottomContentStyle' | 'enableEdgeToEdgeBottomSafeAreaPadding'> &
    Pick<ScreenWrapperOfflineIndicatorsProps, 'offlineIndicatorStyle'>;

export default TabRootScreenWrapperProps;
