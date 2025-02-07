import ONYXKEYS from '@src/ONYXKEYS';
import {useState, useEffect} from 'react';
import Onyx, {useOnyx} from 'react-native-onyx';
import type {OnyxEntry, ReportAction} from 'react-native-onyx';

export default function useTranslateLive(reportID: string, reportAction: OnyxEntry<ReportAction>) {
    const message = reportAction.message.map(fragment => ({
        ...fragment,
        translatedText: 'test',
    }));
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {[reportAction.reportActionID]: {message}});
}
