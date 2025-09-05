import type {FP} from 'group-ib-fp';
import {Capability} from 'group-ib-fp';
import Log from '@libs/Log';

function enableCapabilities(fp: FP) {
    fp.enableCapability(Capability.BatteryStatus, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(BatteryStatus)', {error: e, isRun});
    });
    fp.enableCapability(Capability.Cellular, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(Cellular)', {error: e, isRun});
    });
    fp.enableCapability(Capability.Passcode, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(Passcode)', {error: e, isRun});
    });
    fp.enableCapability(Capability.WebView, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(WebView)', {error: e, isRun});
    });
    fp.enableCapability(Capability.Swizzle, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(Swizzle)', {error: e, isRun});
    });
    fp.enableCapability(Capability.Network, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(Network)', {error: e, isRun});
    });
    fp.enableCapability(Capability.Location, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(Location)', {error: e, isRun});
    });
    fp.enableCapability(Capability.Audio, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(Audio)', {error: e, isRun});
    });
    fp.enableCapability(Capability.CloudIdentifier, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(CloudIdentifier)', {error: e, isRun});
    });
    fp.enableCapability(Capability.DeviceStatus, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(DeviceStatus)', {error: e, isRun});
    });
    fp.enableCapability(Capability.Capture, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(Capture)', {error: e, isRun});
    });
    fp.enableCapability(Capability.Apps, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(Apps)', {error: e, isRun});
    });
    fp.enableCapability(Capability.Proxy, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(Proxy)', {error: e, isRun});
    });
    fp.enableCapability(Capability.Keyboard, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(Keyboard)', {error: e, isRun});
    });
    fp.enableCapability(Capability.Behavior, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(Behavior)', {error: e, isRun});
    });
    fp.enableCapability(Capability.PreventScreenshots, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(PreventScreenshots)', {error: e, isRun});
    });
    fp.enableCapability(Capability.Security, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(Security)', {error: e, isRun});
    });
    fp.enableCapability(Capability.Advertise, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(Advertise)', {error: e, isRun});
    });
    fp.enableCapability(Capability.PortScan, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(PortScan)', {error: e, isRun});
    });
    fp.enableCapability(Capability.GlobalId, (e: string, isRun: boolean) => {
        Log.warn('[Fraud Protection] enableCapability(GlobalId)', {error: e, isRun});
    });
}

export default enableCapabilities;
