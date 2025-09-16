import type {FP} from 'group-ib-fp';
import {Capability} from 'group-ib-fp';
import logCapability from './log';

function enableCapabilities(fp: FP) {
    fp.enableCapability(Capability.BatteryStatus, (e: string, isRun: boolean) => {
        logCapability('BatteryStatus', e, isRun);
    });
    fp.enableCapability(Capability.Cellular, (e: string, isRun: boolean) => {
        logCapability('Cellular', e, isRun);
    });
    fp.enableCapability(Capability.Passcode, (e: string, isRun: boolean) => {
        logCapability('Passcode', e, isRun);
    });
    fp.enableCapability(Capability.WebView, (e: string, isRun: boolean) => {
        logCapability('WebView', e, isRun);
    });
    fp.enableCapability(Capability.Swizzle, (e: string, isRun: boolean) => {
        logCapability('Swizzle', e, isRun);
    });
    fp.enableCapability(Capability.Network, (e: string, isRun: boolean) => {
        logCapability('Network', e, isRun);
    });
    fp.enableCapability(Capability.Location, (e: string, isRun: boolean) => {
        logCapability('Location', e, isRun);
    });
    fp.enableCapability(Capability.Audio, (e: string, isRun: boolean) => {
        logCapability('Audio', e, isRun);
    });
    fp.enableCapability(Capability.CloudIdentifier, (e: string, isRun: boolean) => {
        logCapability('CloudIdentifier', e, isRun);
    });
    fp.enableCapability(Capability.DeviceStatus, (e: string, isRun: boolean) => {
        logCapability('DeviceStatus', e, isRun);
    });
    fp.enableCapability(Capability.Capture, (e: string, isRun: boolean) => {
        logCapability('Capture', e, isRun);
    });
    fp.enableCapability(Capability.Apps, (e: string, isRun: boolean) => {
        logCapability('Apps', e, isRun);
    });
    fp.enableCapability(Capability.Proxy, (e: string, isRun: boolean) => {
        logCapability('Proxy', e, isRun);
    });
    fp.enableCapability(Capability.Keyboard, (e: string, isRun: boolean) => {
        logCapability('Keyboard', e, isRun);
    });
    fp.enableCapability(Capability.Behavior, (e: string, isRun: boolean) => {
        logCapability('Behavior', e, isRun);
    });
    fp.enableCapability(Capability.Security, (e: string, isRun: boolean) => {
        logCapability('Security', e, isRun);
    });
    fp.enableCapability(Capability.Advertise, (e: string, isRun: boolean) => {
        logCapability('Advertise', e, isRun);
    });
    fp.enableCapability(Capability.PortScan, (e: string, isRun: boolean) => {
        logCapability('PortScan', e, isRun);
    });
    fp.enableCapability(Capability.GlobalId, (e: string, isRun: boolean) => {
        logCapability('GlobalId', e, isRun);
    });
}

export default enableCapabilities;
