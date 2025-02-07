import ONYXKEYS from '@src/ONYXKEYS';
import {useEffect} from 'react';
import Onyx, {useOnyx} from 'react-native-onyx';
import type {OnyxEntry, ReportAction} from 'react-native-onyx';
import * as API from '@libs/API';
import useLocalize from './useLocalize';

export default function useTranslateLive(reportID: string, reportAction: OnyxEntry<ReportAction>) {
    const {preferredLocale} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION);

    useEffect(() => {
        console.log('over here 1')
        if (reportAction.message.length > 1) {
            return;
        }
        console.log('over here 2')
        if (reportAction.actorAccountID === session?.accountID) {
            return;
        }
        console.log('over here 3')
        if (!reportAction?.message?.[0]?.html) {
            return;
        }

        const fragment = reportAction.message[0];
        console.log('over here 4')
        if (fragment.translatedText && fragment.translatedLocale === preferredLocale) {
            return;
        }

        console.log('over here 5')
        API.makeRequestWithSideEffects('Translate', {
            type: 'live',
            textToTranslate: reportAction?.message?.[0]?.html,
            targetLanguage: preferredLocale,
        }).then((response) => {
            console.log('over here', response)
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [reportAction.reportActionID]: {
                    message: [{...reportAction?.message[0], translatedText: response.translation, translatedLocale: preferredLocale}]
                }
            });
        });
    }, [reportID, reportAction.reportActionID]);
}
