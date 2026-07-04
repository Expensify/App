var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) =>
    function __require() {
        try {
            return (mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = {exports: {}}).exports, mod), mod.exports);
        } catch (e) {
            throw ((mod = 0), e);
        }
    };
var __export = (target, all) => {
    for (var name in all) __defProp(target, name, {get: all[name], enumerable: true});
};
var __copyProps = (to, from, except, desc) => {
    if ((from && typeof from === 'object') || typeof from === 'function') {
        for (let key of __getOwnPropNames(from))
            if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable});
    }
    return to;
};
var __toESM = (mod, isNodeMode, target) => (
    (target = mod != null ? __create(__getProtoOf(mod)) : {}),
    __copyProps(
        // If the importer is in node compatibility mode or this is not an ESM
        // file that has been converted to a CommonJS file using a Babel-
        // compatible transform (i.e. "__esModule" has not been set), then set
        // "default" to the CommonJS "module.exports" for node compatibility.
        isNodeMode || !mod || !mod.__esModule ? __defProp(target, 'default', {value: mod, enumerable: true}) : target,
        mod,
    )
);
var __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', {value: true}), mod);

// node_modules/bottleneck/light.js
var require_light = __commonJS({
    'node_modules/bottleneck/light.js'(exports2, module2) {
        (function (global2, factory) {
            typeof exports2 === 'object' && typeof module2 !== 'undefined'
                ? (module2.exports = factory())
                : typeof define === 'function' && define.amd
                  ? define(factory)
                  : (global2.Bottleneck = factory());
        })(exports2, function () {
            'use strict';
            var commonjsGlobal =
                typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};
            function getCjsExportFromNamespace(n) {
                return (n && n['default']) || n;
            }
            var load = function (received, defaults, onto = {}) {
                var k, ref, v;
                for (k in defaults) {
                    v = defaults[k];
                    onto[k] = (ref = received[k]) != null ? ref : v;
                }
                return onto;
            };
            var overwrite = function (received, defaults, onto = {}) {
                var k, v;
                for (k in received) {
                    v = received[k];
                    if (defaults[k] !== void 0) {
                        onto[k] = v;
                    }
                }
                return onto;
            };
            var parser = {
                load,
                overwrite,
            };
            var DLList;
            DLList = class DLList {
                constructor(incr, decr) {
                    this.incr = incr;
                    this.decr = decr;
                    this._first = null;
                    this._last = null;
                    this.length = 0;
                }
                push(value) {
                    var node;
                    this.length++;
                    if (typeof this.incr === 'function') {
                        this.incr();
                    }
                    node = {
                        value,
                        prev: this._last,
                        next: null,
                    };
                    if (this._last != null) {
                        this._last.next = node;
                        this._last = node;
                    } else {
                        this._first = this._last = node;
                    }
                    return void 0;
                }
                shift() {
                    var value;
                    if (this._first == null) {
                        return;
                    } else {
                        this.length--;
                        if (typeof this.decr === 'function') {
                            this.decr();
                        }
                    }
                    value = this._first.value;
                    if ((this._first = this._first.next) != null) {
                        this._first.prev = null;
                    } else {
                        this._last = null;
                    }
                    return value;
                }
                first() {
                    if (this._first != null) {
                        return this._first.value;
                    }
                }
                getArray() {
                    var node, ref, results;
                    node = this._first;
                    results = [];
                    while (node != null) {
                        results.push(((ref = node), (node = node.next), ref.value));
                    }
                    return results;
                }
                forEachShift(cb) {
                    var node;
                    node = this.shift();
                    while (node != null) {
                        (cb(node), (node = this.shift()));
                    }
                    return void 0;
                }
                debug() {
                    var node, ref, ref1, ref2, results;
                    node = this._first;
                    results = [];
                    while (node != null) {
                        results.push(
                            ((ref = node),
                            (node = node.next),
                            {
                                value: ref.value,
                                prev: (ref1 = ref.prev) != null ? ref1.value : void 0,
                                next: (ref2 = ref.next) != null ? ref2.value : void 0,
                            }),
                        );
                    }
                    return results;
                }
            };
            var DLList_1 = DLList;
            var Events;
            Events = class Events {
                constructor(instance) {
                    this.instance = instance;
                    this._events = {};
                    if (this.instance.on != null || this.instance.once != null || this.instance.removeAllListeners != null) {
                        throw new Error('An Emitter already exists for this object');
                    }
                    this.instance.on = (name, cb) => {
                        return this._addListener(name, 'many', cb);
                    };
                    this.instance.once = (name, cb) => {
                        return this._addListener(name, 'once', cb);
                    };
                    this.instance.removeAllListeners = (name = null) => {
                        if (name != null) {
                            return delete this._events[name];
                        } else {
                            return (this._events = {});
                        }
                    };
                }
                _addListener(name, status, cb) {
                    var base;
                    if ((base = this._events)[name] == null) {
                        base[name] = [];
                    }
                    this._events[name].push({cb, status});
                    return this.instance;
                }
                listenerCount(name) {
                    if (this._events[name] != null) {
                        return this._events[name].length;
                    } else {
                        return 0;
                    }
                }
                async trigger(name, ...args) {
                    var e, promises;
                    try {
                        if (name !== 'debug') {
                            this.trigger('debug', `Event triggered: ${name}`, args);
                        }
                        if (this._events[name] == null) {
                            return;
                        }
                        this._events[name] = this._events[name].filter(function (listener) {
                            return listener.status !== 'none';
                        });
                        promises = this._events[name].map(async (listener) => {
                            var e2, returned;
                            if (listener.status === 'none') {
                                return;
                            }
                            if (listener.status === 'once') {
                                listener.status = 'none';
                            }
                            try {
                                returned = typeof listener.cb === 'function' ? listener.cb(...args) : void 0;
                                if (typeof (returned != null ? returned.then : void 0) === 'function') {
                                    return await returned;
                                } else {
                                    return returned;
                                }
                            } catch (error) {
                                e2 = error;
                                {
                                    this.trigger('error', e2);
                                }
                                return null;
                            }
                        });
                        return (await Promise.all(promises)).find(function (x) {
                            return x != null;
                        });
                    } catch (error) {
                        e = error;
                        {
                            this.trigger('error', e);
                        }
                        return null;
                    }
                }
            };
            var Events_1 = Events;
            var DLList$1, Events$1, Queues;
            DLList$1 = DLList_1;
            Events$1 = Events_1;
            Queues = class Queues {
                constructor(num_priorities) {
                    var i;
                    this.Events = new Events$1(this);
                    this._length = 0;
                    this._lists = function () {
                        var j, ref, results;
                        results = [];
                        for (i = j = 1, ref = num_priorities; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
                            results.push(
                                new DLList$1(
                                    () => {
                                        return this.incr();
                                    },
                                    () => {
                                        return this.decr();
                                    },
                                ),
                            );
                        }
                        return results;
                    }.call(this);
                }
                incr() {
                    if (this._length++ === 0) {
                        return this.Events.trigger('leftzero');
                    }
                }
                decr() {
                    if (--this._length === 0) {
                        return this.Events.trigger('zero');
                    }
                }
                push(job) {
                    return this._lists[job.options.priority].push(job);
                }
                queued(priority) {
                    if (priority != null) {
                        return this._lists[priority].length;
                    } else {
                        return this._length;
                    }
                }
                shiftAll(fn) {
                    return this._lists.forEach(function (list) {
                        return list.forEachShift(fn);
                    });
                }
                getFirst(arr = this._lists) {
                    var j, len, list;
                    for (j = 0, len = arr.length; j < len; j++) {
                        list = arr[j];
                        if (list.length > 0) {
                            return list;
                        }
                    }
                    return [];
                }
                shiftLastFrom(priority) {
                    return this.getFirst(this._lists.slice(priority).reverse()).shift();
                }
            };
            var Queues_1 = Queues;
            var BottleneckError;
            BottleneckError = class BottleneckError extends Error {};
            var BottleneckError_1 = BottleneckError;
            var BottleneckError$1, DEFAULT_PRIORITY, Job, NUM_PRIORITIES, parser$1;
            NUM_PRIORITIES = 10;
            DEFAULT_PRIORITY = 5;
            parser$1 = parser;
            BottleneckError$1 = BottleneckError_1;
            Job = class Job {
                constructor(task, args, options, jobDefaults, rejectOnDrop, Events2, _states, Promise2) {
                    this.task = task;
                    this.args = args;
                    this.rejectOnDrop = rejectOnDrop;
                    this.Events = Events2;
                    this._states = _states;
                    this.Promise = Promise2;
                    this.options = parser$1.load(options, jobDefaults);
                    this.options.priority = this._sanitizePriority(this.options.priority);
                    if (this.options.id === jobDefaults.id) {
                        this.options.id = `${this.options.id}-${this._randomIndex()}`;
                    }
                    this.promise = new this.Promise((_resolve, _reject) => {
                        this._resolve = _resolve;
                        this._reject = _reject;
                    });
                    this.retryCount = 0;
                }
                _sanitizePriority(priority) {
                    var sProperty;
                    sProperty = ~~priority !== priority ? DEFAULT_PRIORITY : priority;
                    if (sProperty < 0) {
                        return 0;
                    } else if (sProperty > NUM_PRIORITIES - 1) {
                        return NUM_PRIORITIES - 1;
                    } else {
                        return sProperty;
                    }
                }
                _randomIndex() {
                    return Math.random().toString(36).slice(2);
                }
                doDrop({error, message = 'This job has been dropped by Bottleneck'} = {}) {
                    if (this._states.remove(this.options.id)) {
                        if (this.rejectOnDrop) {
                            this._reject(error != null ? error : new BottleneckError$1(message));
                        }
                        this.Events.trigger('dropped', {args: this.args, options: this.options, task: this.task, promise: this.promise});
                        return true;
                    } else {
                        return false;
                    }
                }
                _assertStatus(expected) {
                    var status;
                    status = this._states.jobStatus(this.options.id);
                    if (!(status === expected || (expected === 'DONE' && status === null))) {
                        throw new BottleneckError$1(`Invalid job status ${status}, expected ${expected}. Please open an issue at https://github.com/SGrondin/bottleneck/issues`);
                    }
                }
                doReceive() {
                    this._states.start(this.options.id);
                    return this.Events.trigger('received', {args: this.args, options: this.options});
                }
                doQueue(reachedHWM, blocked) {
                    this._assertStatus('RECEIVED');
                    this._states.next(this.options.id);
                    return this.Events.trigger('queued', {args: this.args, options: this.options, reachedHWM, blocked});
                }
                doRun() {
                    if (this.retryCount === 0) {
                        this._assertStatus('QUEUED');
                        this._states.next(this.options.id);
                    } else {
                        this._assertStatus('EXECUTING');
                    }
                    return this.Events.trigger('scheduled', {args: this.args, options: this.options});
                }
                async doExecute(chained, clearGlobalState, run, free) {
                    var error, eventInfo, passed;
                    if (this.retryCount === 0) {
                        this._assertStatus('RUNNING');
                        this._states.next(this.options.id);
                    } else {
                        this._assertStatus('EXECUTING');
                    }
                    eventInfo = {args: this.args, options: this.options, retryCount: this.retryCount};
                    this.Events.trigger('executing', eventInfo);
                    try {
                        passed = await (chained != null ? chained.schedule(this.options, this.task, ...this.args) : this.task(...this.args));
                        if (clearGlobalState()) {
                            this.doDone(eventInfo);
                            await free(this.options, eventInfo);
                            this._assertStatus('DONE');
                            return this._resolve(passed);
                        }
                    } catch (error1) {
                        error = error1;
                        return this._onFailure(error, eventInfo, clearGlobalState, run, free);
                    }
                }
                doExpire(clearGlobalState, run, free) {
                    var error, eventInfo;
                    if (this._states.jobStatus(this.options.id === 'RUNNING')) {
                        this._states.next(this.options.id);
                    }
                    this._assertStatus('EXECUTING');
                    eventInfo = {args: this.args, options: this.options, retryCount: this.retryCount};
                    error = new BottleneckError$1(`This job timed out after ${this.options.expiration} ms.`);
                    return this._onFailure(error, eventInfo, clearGlobalState, run, free);
                }
                async _onFailure(error, eventInfo, clearGlobalState, run, free) {
                    var retry, retryAfter;
                    if (clearGlobalState()) {
                        retry = await this.Events.trigger('failed', error, eventInfo);
                        if (retry != null) {
                            retryAfter = ~~retry;
                            this.Events.trigger('retry', `Retrying ${this.options.id} after ${retryAfter} ms`, eventInfo);
                            this.retryCount++;
                            return run(retryAfter);
                        } else {
                            this.doDone(eventInfo);
                            await free(this.options, eventInfo);
                            this._assertStatus('DONE');
                            return this._reject(error);
                        }
                    }
                }
                doDone(eventInfo) {
                    this._assertStatus('EXECUTING');
                    this._states.next(this.options.id);
                    return this.Events.trigger('done', eventInfo);
                }
            };
            var Job_1 = Job;
            var BottleneckError$2, LocalDatastore, parser$2;
            parser$2 = parser;
            BottleneckError$2 = BottleneckError_1;
            LocalDatastore = class LocalDatastore {
                constructor(instance, storeOptions, storeInstanceOptions) {
                    this.instance = instance;
                    this.storeOptions = storeOptions;
                    this.clientId = this.instance._randomIndex();
                    parser$2.load(storeInstanceOptions, storeInstanceOptions, this);
                    this._nextRequest = this._lastReservoirRefresh = this._lastReservoirIncrease = Date.now();
                    this._running = 0;
                    this._done = 0;
                    this._unblockTime = 0;
                    this.ready = this.Promise.resolve();
                    this.clients = {};
                    this._startHeartbeat();
                }
                _startHeartbeat() {
                    var base;
                    if (
                        this.heartbeat == null &&
                        ((this.storeOptions.reservoirRefreshInterval != null && this.storeOptions.reservoirRefreshAmount != null) ||
                            (this.storeOptions.reservoirIncreaseInterval != null && this.storeOptions.reservoirIncreaseAmount != null))
                    ) {
                        return typeof (base = this.heartbeat =
                            setInterval(() => {
                                var amount, incr, maximum, now, reservoir;
                                now = Date.now();
                                if (this.storeOptions.reservoirRefreshInterval != null && now >= this._lastReservoirRefresh + this.storeOptions.reservoirRefreshInterval) {
                                    this._lastReservoirRefresh = now;
                                    this.storeOptions.reservoir = this.storeOptions.reservoirRefreshAmount;
                                    this.instance._drainAll(this.computeCapacity());
                                }
                                if (this.storeOptions.reservoirIncreaseInterval != null && now >= this._lastReservoirIncrease + this.storeOptions.reservoirIncreaseInterval) {
                                    ({reservoirIncreaseAmount: amount, reservoirIncreaseMaximum: maximum, reservoir} = this.storeOptions);
                                    this._lastReservoirIncrease = now;
                                    incr = maximum != null ? Math.min(amount, maximum - reservoir) : amount;
                                    if (incr > 0) {
                                        this.storeOptions.reservoir += incr;
                                        return this.instance._drainAll(this.computeCapacity());
                                    }
                                }
                            }, this.heartbeatInterval)).unref === 'function'
                            ? base.unref()
                            : void 0;
                    } else {
                        return clearInterval(this.heartbeat);
                    }
                }
                async __publish__(message) {
                    await this.yieldLoop();
                    return this.instance.Events.trigger('message', message.toString());
                }
                async __disconnect__(flush) {
                    await this.yieldLoop();
                    clearInterval(this.heartbeat);
                    return this.Promise.resolve();
                }
                yieldLoop(t = 0) {
                    return new this.Promise(function (resolve, reject) {
                        return setTimeout(resolve, t);
                    });
                }
                computePenalty() {
                    var ref;
                    return (ref = this.storeOptions.penalty) != null ? ref : 15 * this.storeOptions.minTime || 5e3;
                }
                async __updateSettings__(options) {
                    await this.yieldLoop();
                    parser$2.overwrite(options, options, this.storeOptions);
                    this._startHeartbeat();
                    this.instance._drainAll(this.computeCapacity());
                    return true;
                }
                async __running__() {
                    await this.yieldLoop();
                    return this._running;
                }
                async __queued__() {
                    await this.yieldLoop();
                    return this.instance.queued();
                }
                async __done__() {
                    await this.yieldLoop();
                    return this._done;
                }
                async __groupCheck__(time) {
                    await this.yieldLoop();
                    return this._nextRequest + this.timeout < time;
                }
                computeCapacity() {
                    var maxConcurrent, reservoir;
                    ({maxConcurrent, reservoir} = this.storeOptions);
                    if (maxConcurrent != null && reservoir != null) {
                        return Math.min(maxConcurrent - this._running, reservoir);
                    } else if (maxConcurrent != null) {
                        return maxConcurrent - this._running;
                    } else if (reservoir != null) {
                        return reservoir;
                    } else {
                        return null;
                    }
                }
                conditionsCheck(weight) {
                    var capacity;
                    capacity = this.computeCapacity();
                    return capacity == null || weight <= capacity;
                }
                async __incrementReservoir__(incr) {
                    var reservoir;
                    await this.yieldLoop();
                    reservoir = this.storeOptions.reservoir += incr;
                    this.instance._drainAll(this.computeCapacity());
                    return reservoir;
                }
                async __currentReservoir__() {
                    await this.yieldLoop();
                    return this.storeOptions.reservoir;
                }
                isBlocked(now) {
                    return this._unblockTime >= now;
                }
                check(weight, now) {
                    return this.conditionsCheck(weight) && this._nextRequest - now <= 0;
                }
                async __check__(weight) {
                    var now;
                    await this.yieldLoop();
                    now = Date.now();
                    return this.check(weight, now);
                }
                async __register__(index, weight, expiration) {
                    var now, wait;
                    await this.yieldLoop();
                    now = Date.now();
                    if (this.conditionsCheck(weight)) {
                        this._running += weight;
                        if (this.storeOptions.reservoir != null) {
                            this.storeOptions.reservoir -= weight;
                        }
                        wait = Math.max(this._nextRequest - now, 0);
                        this._nextRequest = now + wait + this.storeOptions.minTime;
                        return {
                            success: true,
                            wait,
                            reservoir: this.storeOptions.reservoir,
                        };
                    } else {
                        return {
                            success: false,
                        };
                    }
                }
                strategyIsBlock() {
                    return this.storeOptions.strategy === 3;
                }
                async __submit__(queueLength, weight) {
                    var blocked, now, reachedHWM;
                    await this.yieldLoop();
                    if (this.storeOptions.maxConcurrent != null && weight > this.storeOptions.maxConcurrent) {
                        throw new BottleneckError$2(`Impossible to add a job having a weight of ${weight} to a limiter having a maxConcurrent setting of ${this.storeOptions.maxConcurrent}`);
                    }
                    now = Date.now();
                    reachedHWM = this.storeOptions.highWater != null && queueLength === this.storeOptions.highWater && !this.check(weight, now);
                    blocked = this.strategyIsBlock() && (reachedHWM || this.isBlocked(now));
                    if (blocked) {
                        this._unblockTime = now + this.computePenalty();
                        this._nextRequest = this._unblockTime + this.storeOptions.minTime;
                        this.instance._dropAllQueued();
                    }
                    return {
                        reachedHWM,
                        blocked,
                        strategy: this.storeOptions.strategy,
                    };
                }
                async __free__(index, weight) {
                    await this.yieldLoop();
                    this._running -= weight;
                    this._done += weight;
                    this.instance._drainAll(this.computeCapacity());
                    return {
                        running: this._running,
                    };
                }
            };
            var LocalDatastore_1 = LocalDatastore;
            var BottleneckError$3, States;
            BottleneckError$3 = BottleneckError_1;
            States = class States {
                constructor(status1) {
                    this.status = status1;
                    this._jobs = {};
                    this.counts = this.status.map(function () {
                        return 0;
                    });
                }
                next(id) {
                    var current, next;
                    current = this._jobs[id];
                    next = current + 1;
                    if (current != null && next < this.status.length) {
                        this.counts[current]--;
                        this.counts[next]++;
                        return this._jobs[id]++;
                    } else if (current != null) {
                        this.counts[current]--;
                        return delete this._jobs[id];
                    }
                }
                start(id) {
                    var initial;
                    initial = 0;
                    this._jobs[id] = initial;
                    return this.counts[initial]++;
                }
                remove(id) {
                    var current;
                    current = this._jobs[id];
                    if (current != null) {
                        this.counts[current]--;
                        delete this._jobs[id];
                    }
                    return current != null;
                }
                jobStatus(id) {
                    var ref;
                    return (ref = this.status[this._jobs[id]]) != null ? ref : null;
                }
                statusJobs(status) {
                    var k, pos, ref, results, v;
                    if (status != null) {
                        pos = this.status.indexOf(status);
                        if (pos < 0) {
                            throw new BottleneckError$3(`status must be one of ${this.status.join(', ')}`);
                        }
                        ref = this._jobs;
                        results = [];
                        for (k in ref) {
                            v = ref[k];
                            if (v === pos) {
                                results.push(k);
                            }
                        }
                        return results;
                    } else {
                        return Object.keys(this._jobs);
                    }
                }
                statusCounts() {
                    return this.counts.reduce(
                        (acc, v, i) => {
                            acc[this.status[i]] = v;
                            return acc;
                        },
                        {},
                    );
                }
            };
            var States_1 = States;
            var DLList$2, Sync;
            DLList$2 = DLList_1;
            Sync = class Sync {
                constructor(name, Promise2) {
                    this.schedule = this.schedule.bind(this);
                    this.name = name;
                    this.Promise = Promise2;
                    this._running = 0;
                    this._queue = new DLList$2();
                }
                isEmpty() {
                    return this._queue.length === 0;
                }
                async _tryToRun() {
                    var args, cb, error, reject, resolve, returned, task;
                    if (this._running < 1 && this._queue.length > 0) {
                        this._running++;
                        ({task, args, resolve, reject} = this._queue.shift());
                        cb = await (async function () {
                            try {
                                returned = await task(...args);
                                return function () {
                                    return resolve(returned);
                                };
                            } catch (error1) {
                                error = error1;
                                return function () {
                                    return reject(error);
                                };
                            }
                        })();
                        this._running--;
                        this._tryToRun();
                        return cb();
                    }
                }
                schedule(task, ...args) {
                    var promise, reject, resolve;
                    resolve = reject = null;
                    promise = new this.Promise(function (_resolve, _reject) {
                        resolve = _resolve;
                        return (reject = _reject);
                    });
                    this._queue.push({task, args, resolve, reject});
                    this._tryToRun();
                    return promise;
                }
            };
            var Sync_1 = Sync;
            var version = '2.19.5';
            var version$1 = {
                version,
            };
            var version$2 = /* @__PURE__ */ Object.freeze({
                version,
                default: version$1,
            });
            var require$$2 = () => console.log('You must import the full version of Bottleneck in order to use this feature.');
            var require$$3 = () => console.log('You must import the full version of Bottleneck in order to use this feature.');
            var require$$4 = () => console.log('You must import the full version of Bottleneck in order to use this feature.');
            var Events$2, Group, IORedisConnection$1, RedisConnection$1, Scripts$1, parser$3;
            parser$3 = parser;
            Events$2 = Events_1;
            RedisConnection$1 = require$$2;
            IORedisConnection$1 = require$$3;
            Scripts$1 = require$$4;
            Group = function () {
                class Group2 {
                    constructor(limiterOptions = {}) {
                        this.deleteKey = this.deleteKey.bind(this);
                        this.limiterOptions = limiterOptions;
                        parser$3.load(this.limiterOptions, this.defaults, this);
                        this.Events = new Events$2(this);
                        this.instances = {};
                        this.Bottleneck = Bottleneck_1;
                        this._startAutoCleanup();
                        this.sharedConnection = this.connection != null;
                        if (this.connection == null) {
                            if (this.limiterOptions.datastore === 'redis') {
                                this.connection = new RedisConnection$1(Object.assign({}, this.limiterOptions, {Events: this.Events}));
                            } else if (this.limiterOptions.datastore === 'ioredis') {
                                this.connection = new IORedisConnection$1(Object.assign({}, this.limiterOptions, {Events: this.Events}));
                            }
                        }
                    }
                    key(key = '') {
                        var ref;
                        return (ref = this.instances[key]) != null
                            ? ref
                            : (() => {
                                  var limiter;
                                  limiter = this.instances[key] = new this.Bottleneck(
                                      Object.assign(this.limiterOptions, {
                                          id: `${this.id}-${key}`,
                                          timeout: this.timeout,
                                          connection: this.connection,
                                      }),
                                  );
                                  this.Events.trigger('created', limiter, key);
                                  return limiter;
                              })();
                    }
                    async deleteKey(key = '') {
                        var deleted, instance;
                        instance = this.instances[key];
                        if (this.connection) {
                            deleted = await this.connection.__runCommand__(['del', ...Scripts$1.allKeys(`${this.id}-${key}`)]);
                        }
                        if (instance != null) {
                            delete this.instances[key];
                            await instance.disconnect();
                        }
                        return instance != null || deleted > 0;
                    }
                    limiters() {
                        var k, ref, results, v;
                        ref = this.instances;
                        results = [];
                        for (k in ref) {
                            v = ref[k];
                            results.push({
                                key: k,
                                limiter: v,
                            });
                        }
                        return results;
                    }
                    keys() {
                        return Object.keys(this.instances);
                    }
                    async clusterKeys() {
                        var cursor, end, found, i, k, keys, len, next, start;
                        if (this.connection == null) {
                            return this.Promise.resolve(this.keys());
                        }
                        keys = [];
                        cursor = null;
                        start = `b_${this.id}-`.length;
                        end = '_settings'.length;
                        while (cursor !== 0) {
                            [next, found] = await this.connection.__runCommand__(['scan', cursor != null ? cursor : 0, 'match', `b_${this.id}-*_settings`, 'count', 1e4]);
                            cursor = ~~next;
                            for (i = 0, len = found.length; i < len; i++) {
                                k = found[i];
                                keys.push(k.slice(start, -end));
                            }
                        }
                        return keys;
                    }
                    _startAutoCleanup() {
                        var base;
                        clearInterval(this.interval);
                        return typeof (base = this.interval =
                            setInterval(async () => {
                                var e, k, ref, results, time, v;
                                time = Date.now();
                                ref = this.instances;
                                results = [];
                                for (k in ref) {
                                    v = ref[k];
                                    try {
                                        if (await v._store.__groupCheck__(time)) {
                                            results.push(this.deleteKey(k));
                                        } else {
                                            results.push(void 0);
                                        }
                                    } catch (error) {
                                        e = error;
                                        results.push(v.Events.trigger('error', e));
                                    }
                                }
                                return results;
                            }, this.timeout / 2)).unref === 'function'
                            ? base.unref()
                            : void 0;
                    }
                    updateSettings(options = {}) {
                        parser$3.overwrite(options, this.defaults, this);
                        parser$3.overwrite(options, options, this.limiterOptions);
                        if (options.timeout != null) {
                            return this._startAutoCleanup();
                        }
                    }
                    disconnect(flush = true) {
                        var ref;
                        if (!this.sharedConnection) {
                            return (ref = this.connection) != null ? ref.disconnect(flush) : void 0;
                        }
                    }
                }
                Group2.prototype.defaults = {
                    timeout: 1e3 * 60 * 5,
                    connection: null,
                    Promise,
                    id: 'group-key',
                };
                return Group2;
            }.call(commonjsGlobal);
            var Group_1 = Group;
            var Batcher, Events$3, parser$4;
            parser$4 = parser;
            Events$3 = Events_1;
            Batcher = function () {
                class Batcher2 {
                    constructor(options = {}) {
                        this.options = options;
                        parser$4.load(this.options, this.defaults, this);
                        this.Events = new Events$3(this);
                        this._arr = [];
                        this._resetPromise();
                        this._lastFlush = Date.now();
                    }
                    _resetPromise() {
                        return (this._promise = new this.Promise((res, rej) => {
                            return (this._resolve = res);
                        }));
                    }
                    _flush() {
                        clearTimeout(this._timeout);
                        this._lastFlush = Date.now();
                        this._resolve();
                        this.Events.trigger('batch', this._arr);
                        this._arr = [];
                        return this._resetPromise();
                    }
                    add(data) {
                        var ret;
                        this._arr.push(data);
                        ret = this._promise;
                        if (this._arr.length === this.maxSize) {
                            this._flush();
                        } else if (this.maxTime != null && this._arr.length === 1) {
                            this._timeout = setTimeout(() => {
                                return this._flush();
                            }, this.maxTime);
                        }
                        return ret;
                    }
                }
                Batcher2.prototype.defaults = {
                    maxTime: null,
                    maxSize: null,
                    Promise,
                };
                return Batcher2;
            }.call(commonjsGlobal);
            var Batcher_1 = Batcher;
            var require$$4$1 = () => console.log('You must import the full version of Bottleneck in order to use this feature.');
            var require$$8 = getCjsExportFromNamespace(version$2);
            var Bottleneck,
                DEFAULT_PRIORITY$1,
                Events$4,
                Job$1,
                LocalDatastore$1,
                NUM_PRIORITIES$1,
                Queues$1,
                RedisDatastore$1,
                States$1,
                Sync$1,
                parser$5,
                splice = [].splice;
            NUM_PRIORITIES$1 = 10;
            DEFAULT_PRIORITY$1 = 5;
            parser$5 = parser;
            Queues$1 = Queues_1;
            Job$1 = Job_1;
            LocalDatastore$1 = LocalDatastore_1;
            RedisDatastore$1 = require$$4$1;
            Events$4 = Events_1;
            States$1 = States_1;
            Sync$1 = Sync_1;
            Bottleneck = function () {
                class Bottleneck2 {
                    constructor(options = {}, ...invalid) {
                        var storeInstanceOptions, storeOptions;
                        this._addToQueue = this._addToQueue.bind(this);
                        this._validateOptions(options, invalid);
                        parser$5.load(options, this.instanceDefaults, this);
                        this._queues = new Queues$1(NUM_PRIORITIES$1);
                        this._scheduled = {};
                        this._states = new States$1(['RECEIVED', 'QUEUED', 'RUNNING', 'EXECUTING'].concat(this.trackDoneStatus ? ['DONE'] : []));
                        this._limiter = null;
                        this.Events = new Events$4(this);
                        this._submitLock = new Sync$1('submit', this.Promise);
                        this._registerLock = new Sync$1('register', this.Promise);
                        storeOptions = parser$5.load(options, this.storeDefaults, {});
                        this._store = function () {
                            if (this.datastore === 'redis' || this.datastore === 'ioredis' || this.connection != null) {
                                storeInstanceOptions = parser$5.load(options, this.redisStoreDefaults, {});
                                return new RedisDatastore$1(this, storeOptions, storeInstanceOptions);
                            } else if (this.datastore === 'local') {
                                storeInstanceOptions = parser$5.load(options, this.localStoreDefaults, {});
                                return new LocalDatastore$1(this, storeOptions, storeInstanceOptions);
                            } else {
                                throw new Bottleneck2.prototype.BottleneckError(`Invalid datastore type: ${this.datastore}`);
                            }
                        }.call(this);
                        this._queues.on('leftzero', () => {
                            var ref;
                            return (ref = this._store.heartbeat) != null ? (typeof ref.ref === 'function' ? ref.ref() : void 0) : void 0;
                        });
                        this._queues.on('zero', () => {
                            var ref;
                            return (ref = this._store.heartbeat) != null ? (typeof ref.unref === 'function' ? ref.unref() : void 0) : void 0;
                        });
                    }
                    _validateOptions(options, invalid) {
                        if (!(options != null && typeof options === 'object' && invalid.length === 0)) {
                            throw new Bottleneck2.prototype.BottleneckError(
                                "Bottleneck v2 takes a single object argument. Refer to https://github.com/SGrondin/bottleneck#upgrading-to-v2 if you're upgrading from Bottleneck v1.",
                            );
                        }
                    }
                    ready() {
                        return this._store.ready;
                    }
                    clients() {
                        return this._store.clients;
                    }
                    channel() {
                        return `b_${this.id}`;
                    }
                    channel_client() {
                        return `b_${this.id}_${this._store.clientId}`;
                    }
                    publish(message) {
                        return this._store.__publish__(message);
                    }
                    disconnect(flush = true) {
                        return this._store.__disconnect__(flush);
                    }
                    chain(_limiter) {
                        this._limiter = _limiter;
                        return this;
                    }
                    queued(priority) {
                        return this._queues.queued(priority);
                    }
                    clusterQueued() {
                        return this._store.__queued__();
                    }
                    empty() {
                        return this.queued() === 0 && this._submitLock.isEmpty();
                    }
                    running() {
                        return this._store.__running__();
                    }
                    done() {
                        return this._store.__done__();
                    }
                    jobStatus(id) {
                        return this._states.jobStatus(id);
                    }
                    jobs(status) {
                        return this._states.statusJobs(status);
                    }
                    counts() {
                        return this._states.statusCounts();
                    }
                    _randomIndex() {
                        return Math.random().toString(36).slice(2);
                    }
                    check(weight = 1) {
                        return this._store.__check__(weight);
                    }
                    _clearGlobalState(index) {
                        if (this._scheduled[index] != null) {
                            clearTimeout(this._scheduled[index].expiration);
                            delete this._scheduled[index];
                            return true;
                        } else {
                            return false;
                        }
                    }
                    async _free(index, job, options, eventInfo) {
                        var e, running;
                        try {
                            ({running} = await this._store.__free__(index, options.weight));
                            this.Events.trigger('debug', `Freed ${options.id}`, eventInfo);
                            if (running === 0 && this.empty()) {
                                return this.Events.trigger('idle');
                            }
                        } catch (error1) {
                            e = error1;
                            return this.Events.trigger('error', e);
                        }
                    }
                    _run(index, job, wait) {
                        var clearGlobalState, free, run;
                        job.doRun();
                        clearGlobalState = this._clearGlobalState.bind(this, index);
                        run = this._run.bind(this, index, job);
                        free = this._free.bind(this, index, job);
                        return (this._scheduled[index] = {
                            timeout: setTimeout(() => {
                                return job.doExecute(this._limiter, clearGlobalState, run, free);
                            }, wait),
                            expiration:
                                job.options.expiration != null
                                    ? setTimeout(function () {
                                          return job.doExpire(clearGlobalState, run, free);
                                      }, wait + job.options.expiration)
                                    : void 0,
                            job,
                        });
                    }
                    _drainOne(capacity) {
                        return this._registerLock.schedule(() => {
                            var args, index, next, options, queue;
                            if (this.queued() === 0) {
                                return this.Promise.resolve(null);
                            }
                            queue = this._queues.getFirst();
                            ({options, args} = next = queue.first());
                            if (capacity != null && options.weight > capacity) {
                                return this.Promise.resolve(null);
                            }
                            this.Events.trigger('debug', `Draining ${options.id}`, {args, options});
                            index = this._randomIndex();
                            return this._store.__register__(index, options.weight, options.expiration).then(({success, wait, reservoir}) => {
                                var empty;
                                this.Events.trigger('debug', `Drained ${options.id}`, {success, args, options});
                                if (success) {
                                    queue.shift();
                                    empty = this.empty();
                                    if (empty) {
                                        this.Events.trigger('empty');
                                    }
                                    if (reservoir === 0) {
                                        this.Events.trigger('depleted', empty);
                                    }
                                    this._run(index, next, wait);
                                    return this.Promise.resolve(options.weight);
                                } else {
                                    return this.Promise.resolve(null);
                                }
                            });
                        });
                    }
                    _drainAll(capacity, total = 0) {
                        return this._drainOne(capacity)
                            .then((drained) => {
                                var newCapacity;
                                if (drained != null) {
                                    newCapacity = capacity != null ? capacity - drained : capacity;
                                    return this._drainAll(newCapacity, total + drained);
                                } else {
                                    return this.Promise.resolve(total);
                                }
                            })
                            .catch((e) => {
                                return this.Events.trigger('error', e);
                            });
                    }
                    _dropAllQueued(message) {
                        return this._queues.shiftAll(function (job) {
                            return job.doDrop({message});
                        });
                    }
                    stop(options = {}) {
                        var done, waitForExecuting;
                        options = parser$5.load(options, this.stopDefaults);
                        waitForExecuting = (at) => {
                            var finished;
                            finished = () => {
                                var counts;
                                counts = this._states.counts;
                                return counts[0] + counts[1] + counts[2] + counts[3] === at;
                            };
                            return new this.Promise((resolve, reject) => {
                                if (finished()) {
                                    return resolve();
                                } else {
                                    return this.on('done', () => {
                                        if (finished()) {
                                            this.removeAllListeners('done');
                                            return resolve();
                                        }
                                    });
                                }
                            });
                        };
                        done = options.dropWaitingJobs
                            ? ((this._run = function (index, next) {
                                  return next.doDrop({
                                      message: options.dropErrorMessage,
                                  });
                              }),
                              (this._drainOne = () => {
                                  return this.Promise.resolve(null);
                              }),
                              this._registerLock.schedule(() => {
                                  return this._submitLock.schedule(() => {
                                      var k, ref, v;
                                      ref = this._scheduled;
                                      for (k in ref) {
                                          v = ref[k];
                                          if (this.jobStatus(v.job.options.id) === 'RUNNING') {
                                              clearTimeout(v.timeout);
                                              clearTimeout(v.expiration);
                                              v.job.doDrop({
                                                  message: options.dropErrorMessage,
                                              });
                                          }
                                      }
                                      this._dropAllQueued(options.dropErrorMessage);
                                      return waitForExecuting(0);
                                  });
                              }))
                            : this.schedule(
                                  {
                                      priority: NUM_PRIORITIES$1 - 1,
                                      weight: 0,
                                  },
                                  () => {
                                      return waitForExecuting(1);
                                  },
                              );
                        this._receive = function (job) {
                            return job._reject(new Bottleneck2.prototype.BottleneckError(options.enqueueErrorMessage));
                        };
                        this.stop = () => {
                            return this.Promise.reject(new Bottleneck2.prototype.BottleneckError('stop() has already been called'));
                        };
                        return done;
                    }
                    async _addToQueue(job) {
                        var args, blocked, error, options, reachedHWM, shifted, strategy;
                        ({args, options} = job);
                        try {
                            ({reachedHWM, blocked, strategy} = await this._store.__submit__(this.queued(), options.weight));
                        } catch (error1) {
                            error = error1;
                            this.Events.trigger('debug', `Could not queue ${options.id}`, {args, options, error});
                            job.doDrop({error});
                            return false;
                        }
                        if (blocked) {
                            job.doDrop();
                            return true;
                        } else if (reachedHWM) {
                            shifted =
                                strategy === Bottleneck2.prototype.strategy.LEAK
                                    ? this._queues.shiftLastFrom(options.priority)
                                    : strategy === Bottleneck2.prototype.strategy.OVERFLOW_PRIORITY
                                      ? this._queues.shiftLastFrom(options.priority + 1)
                                      : strategy === Bottleneck2.prototype.strategy.OVERFLOW
                                        ? job
                                        : void 0;
                            if (shifted != null) {
                                shifted.doDrop();
                            }
                            if (shifted == null || strategy === Bottleneck2.prototype.strategy.OVERFLOW) {
                                if (shifted == null) {
                                    job.doDrop();
                                }
                                return reachedHWM;
                            }
                        }
                        job.doQueue(reachedHWM, blocked);
                        this._queues.push(job);
                        await this._drainAll();
                        return reachedHWM;
                    }
                    _receive(job) {
                        if (this._states.jobStatus(job.options.id) != null) {
                            job._reject(new Bottleneck2.prototype.BottleneckError(`A job with the same id already exists (id=${job.options.id})`));
                            return false;
                        } else {
                            job.doReceive();
                            return this._submitLock.schedule(this._addToQueue, job);
                        }
                    }
                    submit(...args) {
                        var cb, fn, job, options, ref, ref1, task;
                        if (typeof args[0] === 'function') {
                            ((ref = args), ([fn, ...args] = ref), ([cb] = splice.call(args, -1)));
                            options = parser$5.load({}, this.jobDefaults);
                        } else {
                            ((ref1 = args), ([options, fn, ...args] = ref1), ([cb] = splice.call(args, -1)));
                            options = parser$5.load(options, this.jobDefaults);
                        }
                        task = (...args2) => {
                            return new this.Promise(function (resolve, reject) {
                                return fn(...args2, function (...args3) {
                                    return (args3[0] != null ? reject : resolve)(args3);
                                });
                            });
                        };
                        job = new Job$1(task, args, options, this.jobDefaults, this.rejectOnDrop, this.Events, this._states, this.Promise);
                        job.promise
                            .then(function (args2) {
                                return typeof cb === 'function' ? cb(...args2) : void 0;
                            })
                            .catch(function (args2) {
                                if (Array.isArray(args2)) {
                                    return typeof cb === 'function' ? cb(...args2) : void 0;
                                } else {
                                    return typeof cb === 'function' ? cb(args2) : void 0;
                                }
                            });
                        return this._receive(job);
                    }
                    schedule(...args) {
                        var job, options, task;
                        if (typeof args[0] === 'function') {
                            [task, ...args] = args;
                            options = {};
                        } else {
                            [options, task, ...args] = args;
                        }
                        job = new Job$1(task, args, options, this.jobDefaults, this.rejectOnDrop, this.Events, this._states, this.Promise);
                        this._receive(job);
                        return job.promise;
                    }
                    wrap(fn) {
                        var schedule, wrapped;
                        schedule = this.schedule.bind(this);
                        wrapped = function (...args) {
                            return schedule(fn.bind(this), ...args);
                        };
                        wrapped.withOptions = function (options, ...args) {
                            return schedule(options, fn, ...args);
                        };
                        return wrapped;
                    }
                    async updateSettings(options = {}) {
                        await this._store.__updateSettings__(parser$5.overwrite(options, this.storeDefaults));
                        parser$5.overwrite(options, this.instanceDefaults, this);
                        return this;
                    }
                    currentReservoir() {
                        return this._store.__currentReservoir__();
                    }
                    incrementReservoir(incr = 0) {
                        return this._store.__incrementReservoir__(incr);
                    }
                }
                Bottleneck2.default = Bottleneck2;
                Bottleneck2.Events = Events$4;
                Bottleneck2.version = Bottleneck2.prototype.version = require$$8.version;
                Bottleneck2.strategy = Bottleneck2.prototype.strategy = {
                    LEAK: 1,
                    OVERFLOW: 2,
                    OVERFLOW_PRIORITY: 4,
                    BLOCK: 3,
                };
                Bottleneck2.BottleneckError = Bottleneck2.prototype.BottleneckError = BottleneckError_1;
                Bottleneck2.Group = Bottleneck2.prototype.Group = Group_1;
                Bottleneck2.RedisConnection = Bottleneck2.prototype.RedisConnection = require$$2;
                Bottleneck2.IORedisConnection = Bottleneck2.prototype.IORedisConnection = require$$3;
                Bottleneck2.Batcher = Bottleneck2.prototype.Batcher = Batcher_1;
                Bottleneck2.prototype.jobDefaults = {
                    priority: DEFAULT_PRIORITY$1,
                    weight: 1,
                    expiration: null,
                    id: '<no-id>',
                };
                Bottleneck2.prototype.storeDefaults = {
                    maxConcurrent: null,
                    minTime: 0,
                    highWater: null,
                    strategy: Bottleneck2.prototype.strategy.LEAK,
                    penalty: null,
                    reservoir: null,
                    reservoirRefreshInterval: null,
                    reservoirRefreshAmount: null,
                    reservoirIncreaseInterval: null,
                    reservoirIncreaseAmount: null,
                    reservoirIncreaseMaximum: null,
                };
                Bottleneck2.prototype.localStoreDefaults = {
                    Promise,
                    timeout: null,
                    heartbeatInterval: 250,
                };
                Bottleneck2.prototype.redisStoreDefaults = {
                    Promise,
                    timeout: null,
                    heartbeatInterval: 5e3,
                    clientTimeout: 1e4,
                    Redis: null,
                    clientOptions: {},
                    clusterNodes: null,
                    clearDatastore: false,
                    connection: null,
                };
                Bottleneck2.prototype.instanceDefaults = {
                    datastore: 'local',
                    connection: null,
                    id: '<no-id>',
                    rejectOnDrop: true,
                    trackDoneStatus: false,
                    Promise,
                };
                Bottleneck2.prototype.stopDefaults = {
                    enqueueErrorMessage: 'This limiter has been stopped and cannot accept new jobs.',
                    dropWaitingJobs: true,
                    dropErrorMessage: 'This limiter has been stopped.',
                };
                return Bottleneck2;
            }.call(commonjsGlobal);
            var Bottleneck_1 = Bottleneck;
            var lib = Bottleneck_1;
            return lib;
        });
    },
});

// node_modules/@octokit/plugin-throttling/dist-bundle/index.js
var dist_bundle_exports = {};
__export(dist_bundle_exports, {
    throttling: () => throttling,
});
module.exports = __toCommonJS(dist_bundle_exports);
var import_light = __toESM(require_light(), 1);
var VERSION = '0.0.0-development';
var noop = () => Promise.resolve();
function wrapRequest(state, request, options) {
    return state.retryLimiter.schedule(doRequest, state, request, options);
}
async function doRequest(state, request, options) {
    const {pathname} = new URL(options.url, 'http://github.test');
    const isAuth = isAuthRequest(options.method, pathname);
    const isWrite = !isAuth && options.method !== 'GET' && options.method !== 'HEAD';
    const isSearch = options.method === 'GET' && pathname.startsWith('/search/');
    const isGraphQL = pathname.startsWith('/graphql');
    const retryCount = ~~request.retryCount;
    const jobOptions = retryCount > 0 ? {priority: 0, weight: 0} : {};
    if (state.clustering) {
        jobOptions.expiration = 1e3 * 60;
    }
    if (isWrite || isGraphQL) {
        await state.write.key(state.id).schedule(jobOptions, noop);
    }
    if (isWrite && state.triggersNotification(pathname)) {
        await state.notifications.key(state.id).schedule(jobOptions, noop);
    }
    if (isSearch) {
        await state.search.key(state.id).schedule(jobOptions, noop);
    }
    const req = (isAuth ? state.auth : state.global).key(state.id).schedule(jobOptions, request, options);
    if (isGraphQL) {
        const res = await req;
        if (res.data.errors != null && res.data.errors.some((error) => error.type === 'RATE_LIMITED')) {
            const error = Object.assign(new Error('GraphQL Rate Limit Exceeded'), {
                response: res,
                data: res.data,
            });
            throw error;
        }
    }
    return req;
}
function isAuthRequest(method, pathname) {
    return (
        (method === 'PATCH' && // https://docs.github.com/en/rest/apps/apps?apiVersion=2022-11-28#create-a-scoped-access-token
            /^\/applications\/[^/]+\/token\/scoped$/.test(pathname)) ||
        (method === 'POST' && // https://docs.github.com/en/rest/apps/oauth-applications?apiVersion=2022-11-28#reset-a-token
            (/^\/applications\/[^/]+\/token$/.test(pathname) || // https://docs.github.com/en/rest/apps/apps?apiVersion=2022-11-28#create-an-installation-access-token-for-an-app
                /^\/app\/installations\/[^/]+\/access_tokens$/.test(pathname) || // https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
                pathname === '/login/oauth/access_token'))
    );
}
var triggers_notification_paths_default = [
    '/orgs/{org}/invitations',
    '/orgs/{org}/invitations/{invitation_id}',
    '/orgs/{org}/teams/{team_slug}/discussions',
    '/orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments',
    '/repos/{owner}/{repo}/collaborators/{username}',
    '/repos/{owner}/{repo}/commits/{commit_sha}/comments',
    '/repos/{owner}/{repo}/issues',
    '/repos/{owner}/{repo}/issues/{issue_number}/comments',
    '/repos/{owner}/{repo}/issues/{issue_number}/sub_issue',
    '/repos/{owner}/{repo}/issues/{issue_number}/sub_issues/priority',
    '/repos/{owner}/{repo}/pulls',
    '/repos/{owner}/{repo}/pulls/{pull_number}/comments',
    '/repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies',
    '/repos/{owner}/{repo}/pulls/{pull_number}/merge',
    '/repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers',
    '/repos/{owner}/{repo}/pulls/{pull_number}/reviews',
    '/repos/{owner}/{repo}/releases',
    '/teams/{team_id}/discussions',
    '/teams/{team_id}/discussions/{discussion_number}/comments',
];
function routeMatcher(paths) {
    const regexes = paths.map((path) =>
        path
            .split('/')
            .map((c) => (c.startsWith('{') ? '(?:.+?)' : c))
            .join('/'),
    );
    const regex2 = `^(?:${regexes.map((r) => `(?:${r})`).join('|')})[^/]*$`;
    return new RegExp(regex2, 'i');
}
var regex = routeMatcher(triggers_notification_paths_default);
var triggersNotification = regex.test.bind(regex);
var groups = {};
var createGroups = function (Bottleneck, common) {
    groups.global = new Bottleneck.Group({
        id: 'octokit-global',
        maxConcurrent: 10,
        ...common,
    });
    groups.auth = new Bottleneck.Group({
        id: 'octokit-auth',
        maxConcurrent: 1,
        ...common,
    });
    groups.search = new Bottleneck.Group({
        id: 'octokit-search',
        maxConcurrent: 1,
        minTime: 2e3,
        ...common,
    });
    groups.write = new Bottleneck.Group({
        id: 'octokit-write',
        maxConcurrent: 1,
        minTime: 1e3,
        ...common,
    });
    groups.notifications = new Bottleneck.Group({
        id: 'octokit-notifications',
        maxConcurrent: 1,
        minTime: 3e3,
        ...common,
    });
};
function throttling(octokit, octokitOptions) {
    const {
        enabled = true,
        Bottleneck = import_light.default,
        id = 'no-id',
        timeout = 1e3 * 60 * 2,
        // Redis TTL: 2 minutes
        connection,
    } = octokitOptions.throttle || {};
    if (!enabled) {
        return {};
    }
    const common = {timeout};
    if (typeof connection !== 'undefined') {
        common.connection = connection;
    }
    if (groups.global == null) {
        createGroups(Bottleneck, common);
    }
    const state = Object.assign(
        {
            clustering: connection != null,
            triggersNotification,
            fallbackSecondaryRateRetryAfter: 60,
            retryAfterBaseValue: 1e3,
            retryLimiter: new Bottleneck(),
            id,
            ...groups,
        },
        octokitOptions.throttle,
    );
    if (typeof state.onSecondaryRateLimit !== 'function' || typeof state.onRateLimit !== 'function') {
        throw new Error(`octokit/plugin-throttling error:
        You must pass the onSecondaryRateLimit and onRateLimit error handlers.
        See https://octokit.github.io/rest.js/#throttling

        const octokit = new Octokit({
          throttle: {
            onSecondaryRateLimit: (retryAfter, options) => {/* ... */},
            onRateLimit: (retryAfter, options) => {/* ... */}
          }
        })
    `);
    }
    const events = {};
    const emitter = new Bottleneck.Events(events);
    events.on('secondary-limit', state.onSecondaryRateLimit);
    events.on('rate-limit', state.onRateLimit);
    events.on('error', (e) => octokit.log.warn('Error in throttling-plugin limit handler', e));
    state.retryLimiter.on('failed', async function (error, info) {
        const [state2, request, options] = info.args;
        const {pathname} = new URL(options.url, 'http://github.test');
        const shouldRetryGraphQL = pathname.startsWith('/graphql') && error.status !== 401;
        if (!(shouldRetryGraphQL || error.status === 403 || error.status === 429)) {
            return;
        }
        const retryCount = ~~request.retryCount;
        request.retryCount = retryCount;
        options.request.retryCount = retryCount;
        const {wantRetry, retryAfter = 0} = await (async function () {
            if (/\bsecondary rate\b/i.test(error.message)) {
                const retryAfter2 = Number(error.response.headers['retry-after']) || state2.fallbackSecondaryRateRetryAfter;
                const wantRetry2 = await emitter.trigger('secondary-limit', retryAfter2, options, octokit, retryCount);
                return {wantRetry: wantRetry2, retryAfter: retryAfter2};
            }
            if (
                (error.response.headers != null && error.response.headers['x-ratelimit-remaining'] === '0') ||
                (error.response.data?.errors ?? []).some((error2) => error2.type === 'RATE_LIMITED')
            ) {
                const rateLimitReset = new Date(~~error.response.headers['x-ratelimit-reset'] * 1e3).getTime();
                const retryAfter2 = Math.max(
                    // Add one second so we retry _after_ the reset time
                    // https://docs.github.com/en/rest/overview/resources-in-the-rest-api?apiVersion=2022-11-28#exceeding-the-rate-limit
                    Math.ceil((rateLimitReset - Date.now()) / 1e3) + 1,
                    0,
                );
                const wantRetry2 = await emitter.trigger('rate-limit', retryAfter2, options, octokit, retryCount);
                return {wantRetry: wantRetry2, retryAfter: retryAfter2};
            }
            return {};
        })();
        if (wantRetry) {
            request.retryCount++;
            return retryAfter * state2.retryAfterBaseValue;
        }
    });
    octokit.hook.wrap('request', wrapRequest.bind(null, state));
    return {};
}
throttling.VERSION = VERSION;
throttling.triggersNotification = triggersNotification;
// Annotate the CommonJS export names for ESM import in node:
0 &&
    (module.exports = {
        throttling,
    });
module.exports = {...module.exports};
Object.defineProperty(module.exports, '__esModule', {value: true});
