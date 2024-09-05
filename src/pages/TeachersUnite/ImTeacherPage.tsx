import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import * as LoginUtils from '@libs/LoginUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import ImTeacherUpdateEmailPage from './ImTeacherUpdateEmailPage';
import IntroSchoolPrincipalPage from './IntroSchoolPrincipalPage';

type ImTeacherPageOnyxProps = {
    session: OnyxEntry<Session>;
};

type ImTeacherPageProps = ImTeacherPageOnyxProps;

function ImTeacherPage(props: ImTeacherPageProps) {
    const isLoggedInEmailPublicDomain = LoginUtils.isEmailPublicDomain(props.session?.email ?? '');
    return isLoggedInEmailPublicDomain ? <ImTeacherUpdateEmailPage /> : <IntroSchoolPrincipalPage />;
}

ImTeacherPage.displayName = 'ImTeacherPage';

export default function ImTeacherPageOnyx(props: Omit<ImTeacherPageProps, keyof ImTeacherPageOnyxProps>) {
    const [session, sessionMetadata] = useOnyx(ONYXKEYS.SESSION);

    if (isLoadingOnyxValue(sessionMetadata)) {
        return null;
    }

    return (
        <ImTeacherPage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            session={session}
        />
    );
}
