import Log from "@libs/Log";
import {FP, AndroidCapability} from "group-ib-fp";

function enableCapabilities(fp: FP) {
    fp.enableAndroidCapability(AndroidCapability.CellsCollection, (e: any, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(CellsCollection)', {error: e, isRun});
    });
    fp.enableAndroidCapability(AndroidCapability.AccessPointsCollection, (e: any, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(AccessPointsCollection)', {error: e, isRun});
    });
    fp.enableAndroidCapability(AndroidCapability.Location, (e: any, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(Location)', {error: e, isRun});
    });
    fp.enableAndroidCapability(AndroidCapability.GlobalIdentification, (e: any, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(GlobalIdentification)', {error: e, isRun});
    });
    fp.enableAndroidCapability(AndroidCapability.CloudIdentification, (e: any, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(CloudIdentification)', {error: e, isRun});
    });
    fp.enableAndroidCapability(AndroidCapability.CallIdentification, (e: any, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(CallIdentification)', {error: e, isRun});
    });
    fp.enableAndroidCapability(AndroidCapability.ActivityCollection, (e: any, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(ActivityCollection)', {error: e, isRun});
    });
    fp.enableAndroidCapability(AndroidCapability.MotionCollection, (e: any, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(MotionCollection)', {error: e, isRun});
    });
    fp.enableAndroidCapability(AndroidCapability.PackageCollection, (e: any, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableAndroidCapability(PackageCollection)', {error: e, isRun});
    });
}

export default enableCapabilities;
