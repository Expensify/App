import {CIRCULAR_MARKER, maskInspectionEvent, MAX_DEPTH_MARKER, SENSITIVE_VALUE_MASK} from '@libs/XStateInspector/maskSensitive';

describe('maskInspectionEvent', () => {
    it('masks every leaf under a sensitive key at any depth while keeping the shape', () => {
        const masked = maskInspectionEvent({
            snapshot: {
                context: {
                    payload: {pin: '1234', meta: {attempt: 2}},
                    request: {body: {validateCode: '987654', otp: '111111'}},
                },
            },
        });

        expect(masked).toEqual({
            snapshot: {
                context: {
                    payload: {pin: SENSITIVE_VALUE_MASK, meta: {attempt: SENSITIVE_VALUE_MASK}},
                    request: {body: {validateCode: SENSITIVE_VALUE_MASK, otp: SENSITIVE_VALUE_MASK}},
                },
            },
        });
    });

    it('masks sensitive fields inside child-actor input, output and error, which the sanitize hooks never see', () => {
        const masked = maskInspectionEvent({
            snapshot: {
                status: 'done',
                input: {validateCode: '987654', scenarioName: 'REVEAL_CARD'},
                output: {httpStatusCode: 200, body: {pin: 1234}},
                error: {message: 'failed', response: {token: 'abc'}},
            },
        });

        expect(masked).toEqual({
            snapshot: {
                status: 'done',
                input: {validateCode: SENSITIVE_VALUE_MASK, scenarioName: 'REVEAL_CARD'},
                output: {httpStatusCode: 200, body: {pin: SENSITIVE_VALUE_MASK}},
                error: {message: 'failed', response: {token: SENSITIVE_VALUE_MASK}},
            },
        });
    });

    it('masks WebAuthn challenge material wholesale (nonces, signatures and user PII)', () => {
        const masked = maskInspectionEvent({
            snapshot: {
                context: {
                    registrationChallenge: {challenge: 'nonce-abc', user: {id: 'uid', name: 'user@example.com'}},
                    authorizationChallenge: {challenge: 'nonce-def', rpId: 'expensify.com'},
                },
                input: {signedChallenge: 'signature', challenge: 'nonce-ghi'},
            },
        });

        expect(masked).toEqual({
            snapshot: {
                context: {
                    registrationChallenge: {challenge: SENSITIVE_VALUE_MASK, user: {id: SENSITIVE_VALUE_MASK, name: SENSITIVE_VALUE_MASK}},
                    authorizationChallenge: {challenge: SENSITIVE_VALUE_MASK, rpId: SENSITIVE_VALUE_MASK},
                },
                input: {signedChallenge: SENSITIVE_VALUE_MASK, challenge: SENSITIVE_VALUE_MASK},
            },
        });
    });

    it('masks the scenario response body wholesale while keeping the response status fields visible', () => {
        const masked = maskInspectionEvent({
            snapshot: {
                context: {
                    scenarioResponse: {httpStatusCode: 200, reason: 'SUCCESS', message: 'ok', body: {pan: '4111111111111111', expiration: '12/30', cvv: '123'}},
                },
            },
        });

        expect(masked).toEqual({
            snapshot: {
                context: {
                    scenarioResponse: {httpStatusCode: 200, reason: 'SUCCESS', message: 'ok', body: {pan: SENSITIVE_VALUE_MASK, expiration: SENSITIVE_VALUE_MASK, cvv: SENSITIVE_VALUE_MASK}},
                },
            },
        });
    });

    it('masks card secrets and registration key material under their own keys when they travel outside a response body', () => {
        const masked = maskInspectionEvent({
            event: {type: 'CARD_DETAILS_REVEALED', cardID: 'card-1', pan: '4111111111111111', cvv: '123'},
            snapshot: {
                input: {keyInfo: {rawId: 'cred-id', type: 'biometrics-hsm', response: {clientDataJSON: 'eyJjaGFsbGVuZ2UiOiJub25jZSJ9', biometric: {publicKey: 'cred-id', algorithm: -7}}}},
            },
        });

        expect(masked).toEqual({
            event: {type: 'CARD_DETAILS_REVEALED', cardID: 'card-1', pan: SENSITIVE_VALUE_MASK, cvv: SENSITIVE_VALUE_MASK},
            snapshot: {
                input: {
                    keyInfo: {
                        rawId: SENSITIVE_VALUE_MASK,
                        type: SENSITIVE_VALUE_MASK,
                        response: {clientDataJSON: SENSITIVE_VALUE_MASK, biometric: {publicKey: SENSITIVE_VALUE_MASK, algorithm: SENSITIVE_VALUE_MASK}},
                    },
                },
            },
        });
    });

    it('keeps the machine state value readable, even when a state node is named like a sensitive key', () => {
        const masked = maskInspectionEvent({
            snapshot: {
                value: {open: {validateCode: 'enteringCode', outcome: 'success'}},
                context: {validateCode: '987654'},
            },
        });

        expect(masked).toEqual({
            snapshot: {
                value: {open: {validateCode: 'enteringCode', outcome: 'success'}},
                context: {validateCode: SENSITIVE_VALUE_MASK},
            },
        });
    });

    it('scopes the state-value exemption to snapshot.value - a value key under a sensitive key elsewhere is still masked', () => {
        const masked = maskInspectionEvent({
            event: {type: 'SUBMIT', payload: {value: 'secret'}},
            snapshot: {
                value: 'idle',
                context: {request: {body: {value: 'secret'}}},
            },
        });

        expect(masked).toEqual({
            event: {type: 'SUBMIT', payload: {value: SENSITIVE_VALUE_MASK}},
            snapshot: {
                value: 'idle',
                context: {request: {body: {value: SENSITIVE_VALUE_MASK}}},
            },
        });
    });

    it('keeps non-sensitive values and the inspector metadata untouched, including an event type named like a sensitive key', () => {
        const event = {
            type: '@xstate.event',
            sessionId: 'x:1',
            event: {type: 'token', scenarioName: 'REVEAL_CARD', retries: 3, isOffline: false, reason: null},
        };

        expect(maskInspectionEvent(event)).toEqual(event);
    });

    it('masks arrays under a sensitive key element by element and objects inside non-sensitive arrays', () => {
        const masked = maskInspectionEvent({token: ['a', 'b'], steps: ['init', 'verify'], attempts: [{password: 'hunter2', at: 1}]});

        expect(masked).toEqual({token: [SENSITIVE_VALUE_MASK, SENSITIVE_VALUE_MASK], steps: ['init', 'verify'], attempts: [{password: SENSITIVE_VALUE_MASK, at: 1}]});
    });

    it('honors toJSON the way JSON.stringify would, so snapshots shed their unserializable internals', () => {
        const masked = maskInspectionEvent({
            snapshot: {
                machine: {config: 'unserializable'},
                toJSON: () => ({status: 'active', context: {pin: '1234'}}),
            },
            createdAt: new Date('2026-06-12T00:00:00.000Z'),
        });

        expect(masked).toEqual({
            snapshot: {status: 'active', context: {pin: SENSITIVE_VALUE_MASK}},
            createdAt: '2026-06-12T00:00:00.000Z',
        });
    });

    it('drops functions and symbols from objects and nulls them inside arrays, keeping the result postMessage-safe', () => {
        const masked = maskInspectionEvent({
            snapshot: {context: {action: () => 'secret', kept: 1}},
            list: [() => 'secret', 'kept'],
        });

        expect(masked).toStrictEqual({
            snapshot: {context: {kept: 1}},
            list: [null, 'kept'],
        });
    });

    it('collapses circular references to a marker instead of recursing forever', () => {
        const context: Record<string, unknown> = {scenarioName: 'REVEAL_CARD'};
        context.self = context;

        expect(maskInspectionEvent({snapshot: {context}})).toEqual({snapshot: {context: {scenarioName: 'REVEAL_CARD', self: CIRCULAR_MARKER}}});
    });

    it('renders a shared non-circular reference fully in both places', () => {
        const shared = {scenarioName: 'REVEAL_CARD'};

        expect(maskInspectionEvent({snapshot: {context: {scenario: shared}}, event: {scenario: shared}})).toEqual({
            snapshot: {context: {scenario: shared}},
            event: {scenario: shared},
        });
    });

    it('caps the serialization depth with a marker like the default serializer', () => {
        const deep: Record<string, unknown> = {};
        let leaf = deep;
        for (let i = 0; i < 15; i++) {
            const next: Record<string, unknown> = {};
            leaf.next = next;
            leaf = next;
        }

        expect(JSON.stringify(maskInspectionEvent(deep))).toContain(MAX_DEPTH_MARKER);
    });

    it('passes context-less snapshots (promise/callback child actors) through without throwing', () => {
        const masked = maskInspectionEvent({snapshot: {status: 'active', output: undefined, error: undefined, input: undefined}});

        expect(masked).toStrictEqual({snapshot: {status: 'active'}});
    });
});
