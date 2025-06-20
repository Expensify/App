import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import ShareLogList from './ShareLogList';

type ShareLogPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.SHARE_LOG>;

function ShareLogPage({route}: ShareLogPageProps) {
    return <ShareLogList logSource={route.params.source} />;
}

export default ShareLogPage;
