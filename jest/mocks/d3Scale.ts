/* eslint-disable */
/**
 * CJS-compatible mock of d3-scale for Jest.
 *
 * d3-scale is ESM-only ("type": "module") so it cannot be require()'d in Jest's CJS runtime.
 * This file implements exactly the same scaleLinear().domain().nice().ticks() pipeline that
 * victory-native uses internally, so getNiceYAxisTicks() produces identical results in tests.
 *
 * Implements D3's tickSpec algorithm (integer arithmetic to avoid float accumulation),
 * the nice() convergence loop, and the ticks() function — all copied from d3-array/d3-scale source.
 */

const e10 = Math.sqrt(50);
const e5 = Math.sqrt(10);
const e2 = Math.sqrt(2);

function tickSpec(start: number, stop: number, count: number): [number, number, number] {
    const step = (stop - start) / Math.max(0, count);
    const power = Math.floor(Math.log10(step));
    const error = step / 10 ** power;
    const factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
    let i1: number;
    let i2: number;
    let inc: number;
    if (power < 0) {
        inc = 10 ** -power / factor;
        i1 = Math.round(start * inc);
        i2 = Math.round(stop * inc);
        if (i1 / inc < start) {
            i1++;
        }
        if (i2 / inc > stop) {
            i2--;
        }
        inc = -inc;
    } else {
        inc = 10 ** power * factor;
        i1 = Math.round(start / inc);
        i2 = Math.round(stop / inc);
        if (i1 * inc < start) {
            i1++;
        }
        if (i2 * inc > stop) {
            i2--;
        }
    }
    return [i1, i2, inc];
}

function d3Ticks(start: number, stop: number, count: number): number[] {
    if (!(count > 0)) {
        return [];
    }
    if (start === stop) {
        return [start];
    }
    const reverse = stop < start;
    const [i1, i2, inc] = reverse ? tickSpec(stop, start, count) : tickSpec(start, stop, count);
    if (!(i2 >= i1)) {
        return [];
    }
    const n = i2 - i1 + 1;
    const ticks = new Array<number>(n);
    if (reverse) {
        if (inc < 0) {
            for (let i = 0; i < n; i++) {
                ticks[i] = (i2 - i) / -inc;
            }
        } else {
            for (let i = 0; i < n; i++) {
                ticks[i] = (i2 - i) * inc;
            }
        }
    } else if (inc < 0) {
        for (let i = 0; i < n; i++) {
            ticks[i] = (i1 + i) / -inc;
        }
    } else {
        for (let i = 0; i < n; i++) {
            ticks[i] = (i1 + i) * inc;
        }
    }
    return ticks;
}

function tickIncrement(start: number, stop: number, count: number): number {
    return tickSpec(start, stop, count)[2];
}

type Scale = {
    domain: (d?: number[]) => Scale | number[];
    nice: (count?: number) => Scale;
    ticks: (count?: number) => number[];
};

function scaleLinear(): Scale {
    let domain = [0, 1];

    const scale: Scale = {
        domain(d?: number[]) {
            if (!d) {
                return domain;
            }
            domain = [...d];
            return scale;
        },
        nice(count = 10) {
            let [start, stop] = domain;
            let prestep: number | undefined;
            let maxIter = 10;
            if (stop < start) {
                [start, stop] = [stop, start];
            }
            while (maxIter-- > 0) {
                const step = tickIncrement(start, stop, count);
                if (step === prestep) {
                    domain = [start, stop];
                    return scale;
                } else if (step > 0) {
                    start = Math.floor(start / step) * step;
                    stop = Math.ceil(stop / step) * step;
                } else if (step < 0) {
                    start = Math.ceil(start * step) / step;
                    stop = Math.floor(stop * step) / step;
                } else {
                    break;
                }
                prestep = step;
            }
            return scale;
        },
        ticks(count = 10) {
            const [start, stop] = domain;
            return d3Ticks(start, stop, count);
        },
    };

    return scale;
}

export {scaleLinear};
