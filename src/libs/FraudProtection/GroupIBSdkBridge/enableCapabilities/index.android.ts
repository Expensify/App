import {FP, AndroidCapability} from "group-ib-fp";

function enableCapabilities(fp: FP) {
    fp.enableAndroidCapability(AndroidCapability.CellsCollection, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability CellsCollection error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability CellsCollection isRun: ${isRun}`);
        }
    });
    fp.enableAndroidCapability(AndroidCapability.AccessPointsCollection, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability AccessPointsCollection error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability AccessPointsCollection isRun: ${isRun}`);
        }
    });
    fp.enableAndroidCapability(AndroidCapability.Location, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability Location error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability Location isRun: ${isRun}`);
        }
    });
    fp.enableAndroidCapability(AndroidCapability.GlobalIdentification, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability GlobalIdentification error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability GlobalIdentification isRun: ${isRun}`);
        }
    });
    fp.enableAndroidCapability(AndroidCapability.CloudIdentification, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability CloudIdentification error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability CloudIdentification isRun: ${isRun}`);
        }
    });
    fp.enableAndroidCapability(AndroidCapability.CallIdentification, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability ActivityCollection error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability ActivityCollection isRun: ${isRun}`);
        }
    });
    fp.enableAndroidCapability(AndroidCapability.ActivityCollection, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability ActivityCollection error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability ActivityCollection isRun: ${isRun}`);
        }
    });
    fp.enableAndroidCapability(AndroidCapability.MotionCollection, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability MotionCollection error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability MotionCollection isRun: ${isRun}`);
        }
    });
    fp.enableAndroidCapability(AndroidCapability.PackageCollection, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability PackageCollection error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability PackageCollection isRun: ${isRun}`); 
        }
    });
}

export default enableCapabilities;
