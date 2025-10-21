import type {FP} from 'group-ib-fp';
import {AndroidCapability} from 'group-ib-fp';
import logCapability from './log';

function enableCapabilities(fp: FP) {
    fp.enableAndroidCapability(AndroidCapability.CellsCollection, (e: string, isRun: boolean) => {
        logCapability('CellsCollection', e, isRun);
    });
    fp.enableAndroidCapability(AndroidCapability.AccessPointsCollection, (e: string, isRun: boolean) => {
        logCapability('AccessPointsCollection', e, isRun);
    });
    fp.enableAndroidCapability(AndroidCapability.Location, (e: string, isRun: boolean) => {
        logCapability('Location', e, isRun);
    });
    fp.enableAndroidCapability(AndroidCapability.GlobalIdentification, (e: string, isRun: boolean) => {
        logCapability('GlobalIdentification', e, isRun);
    });
    fp.enableAndroidCapability(AndroidCapability.CloudIdentification, (e: string, isRun: boolean) => {
        logCapability('CloudIdentification', e, isRun);
    });
    fp.enableAndroidCapability(AndroidCapability.CallIdentification, (e: string, isRun: boolean) => {
        logCapability('CallIdentification', e, isRun);
    });
    fp.enableAndroidCapability(AndroidCapability.ActivityCollection, (e: string, isRun: boolean) => {
        logCapability('ActivityCollection', e, isRun);
    });
    fp.enableAndroidCapability(AndroidCapability.MotionCollection, (e: string, isRun: boolean) => {
        logCapability('MotionCollection', e, isRun);
    });
    fp.enableAndroidCapability(AndroidCapability.PackageCollection, (e: string, isRun: boolean) => {
        logCapability('PackageCollection', e, isRun);
    });
}

export default enableCapabilities;
