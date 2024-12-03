import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import ShareLogList from './ShareLogList';

type ShareLogPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.SHARE_LOG>;

function ShareLogPage({route}: ShareLogPageProps) {
    return <ShareLogList logSource={route.params.source} />;
}

export default ShareLogPage;
