import {FP, AndroidCapability} from "group-ib-fp";

export default function enableCapabilities(fp: FP) {
    fp.enableAndroidCapability(AndroidCapability.CellsCollection, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability isRun: ${isRun}`);
        }
    });
    fp.enableAndroidCapability(AndroidCapability.AccessPointsCollection, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability isRun: ${isRun}`);
        }
    });
    fp.enableAndroidCapability(AndroidCapability.Location, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability isRun: ${isRun}`);
        }
    });
    fp.enableAndroidCapability(AndroidCapability.GlobalIdentification, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability isRun: ${isRun}`);
        }
    });
    fp.enableAndroidCapability(AndroidCapability.CloudIdentification, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability isRun: ${isRun}`);
        }
    });
    fp.enableAndroidCapability(AndroidCapability.CallIdentification, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability isRun: ${isRun}`);
        }
    });
    fp.enableAndroidCapability(AndroidCapability.ActivityCollection, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability isRun: ${isRun}`);
        }
    });
    fp.enableAndroidCapability(AndroidCapability.MotionCollection, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability isRun: ${isRun}`);
        }
    });
    fp.enableAndroidCapability(AndroidCapability.PackageCollection, (e: any, isRun: boolean) => {
        if (e) {
            console.log(`[Fraud Protection] enableAndroidCapability error: ${e}`);
        }
        if (isRun) {
            console.log(`[Fraud Protection] enableAndroidCapability isRun: ${isRun}`); 
        }
    });
}