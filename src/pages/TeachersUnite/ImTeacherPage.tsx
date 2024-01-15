import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import * as LoginUtils from '@libs/LoginUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';
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

export default withOnyx<ImTeacherPageProps, ImTeacherPageOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ImTeacherPage);
