import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {Text, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import ScreenWrapper from '@components/ScreenWrapper';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PrivatePersonalDetails} from '@src/types/onyx';

type WorkspaceProfileAddressPageOnyxProps = {
    /** User's private personal details */
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
};

type WorkspaceProfileAddressPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ADDRESS> & WorkspaceProfileAddressPageOnyxProps;

function WorkspaceProfileAddressPage({privatePersonalDetails, route}: WorkspaceProfileAddressPageProps) {
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={WorkspaceProfileAddressPage.displayName}
        >
            <Text>abc</Text>
        </ScreenWrapper>
    );
}

WorkspaceProfileAddressPage.displayName = 'WorkspaceProfileAddressPage';

export default WorkspaceProfileAddressPage;
