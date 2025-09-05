import type {FP} from 'group-ib-fp';
import {AndroidCapability} from 'group-ib-fp';
import Log from '@libs/Log';

function enableCapabilities(fp: FP) {
    fp.enableAndroidCapability(AndroidCapability.CellsCollection, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(CellsCollection)', {error: e, isRun});
    });
    fp.enableAndroidCapability(AndroidCapability.AccessPointsCollection, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(AccessPointsCollection)', {error: e, isRun});
    });
    fp.enableAndroidCapability(AndroidCapability.Location, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(Location)', {error: e, isRun});
    });
    fp.enableAndroidCapability(AndroidCapability.GlobalIdentification, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(GlobalIdentification)', {error: e, isRun});
    });
    fp.enableAndroidCapability(AndroidCapability.CloudIdentification, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(CloudIdentification)', {error: e, isRun});
    });
    fp.enableAndroidCapability(AndroidCapability.CallIdentification, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(CallIdentification)', {error: e, isRun});
    });
    fp.enableAndroidCapability(AndroidCapability.ActivityCollection, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(ActivityCollection)', {error: e, isRun});
    });
    fp.enableAndroidCapability(AndroidCapability.MotionCollection, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(MotionCollection)', {error: e, isRun});
    });
    fp.enableAndroidCapability(AndroidCapability.PackageCollection, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(PackageCollection)', {error: e, isRun});
    });
}

export default enableCapabilities;
