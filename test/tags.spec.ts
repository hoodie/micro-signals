import assert from 'node:assert/strict';

import { Signal } from '../src/index.ts';
import test from './lib/test.ts';

const assertEquals: (actual: unknown, expected: unknown) => void = assert.deepStrictEqual;

test(
    'Signal removing an added listener by tags should work after a dispatch',
    () => {
        const receivedPayloads: string[] = [];

        const signal = new Signal<string>();

        const tag = {};

        signal.add((payload) => receivedPayloads.push(payload), tag);

        signal.dispatch('a');
        signal.remove(tag);
        signal.dispatch('b');

        assertEquals(receivedPayloads, ['a']);
    },
);

test(
    'Signal removing an added listener by tags should work before any dispatches',
    () => {
        const receivedPayloads: string[] = [];

        const signal = new Signal<string>();

        const tag = {};

        signal.add((payload) => receivedPayloads.push(payload), tag);

        signal.remove(tag);
        signal.dispatch('a');
        signal.dispatch('b');

        assertEquals(receivedPayloads, []);
    },
);

test(
    'Signal removing an added once listener by tags should stop further updates',
    () => {
        const receivedPayloads: string[] = [];

        const signal = new Signal<string>();

        const tag = {};

        signal.addOnce((payload) => receivedPayloads.push(payload), tag);

        signal.remove(tag);
        signal.dispatch('a');
        signal.dispatch('b');

        assertEquals(receivedPayloads, []);
    },
);

test('Signal should support multiple tags per added listener', () => {
    const receivedPayloads: string[] = [];

    const signal = new Signal<string>();

    const tag1 = {};
    const tag2 = {};
    const tag3 = {};

    signal.add((payload) => receivedPayloads.push(payload), tag1, tag2, tag3);

    signal.dispatch('a');
    signal.remove(tag3);
    signal.dispatch('b');

    assertEquals(receivedPayloads, ['a']);
});

test('Signal should support multiple listener per tag', () => {
    const receivedPayloads1: string[] = [];
    const receivedPayloads2: string[] = [];
    const receivedPayloads3: string[] = [];

    const signal = new Signal<string>();

    const tag1 = {};
    const tag2 = {};

    signal.add((payload) => receivedPayloads1.push(payload), tag1, tag2);
    signal.add((payload) => receivedPayloads2.push(payload), tag1);
    signal.add((payload) => receivedPayloads3.push(payload), tag2);

    signal.dispatch('a');
    signal.remove(tag1);
    signal.dispatch('b');
    signal.remove(tag2);
    signal.dispatch('c');

    assertEquals(receivedPayloads1, ['a']);
    assertEquals(receivedPayloads2, ['a']);
    assertEquals(receivedPayloads3, ['a', 'b']);
});

test(
    'Signal after removing a listener by tag the tag no longer apply',
    () => {
        const receivedPayloads: string[] = [];

        const signal = new Signal<string>();

        const tag1 = {};
        const tag2 = {};

        const listener = (payload: string) => receivedPayloads.push(payload);

        signal.add(listener, tag1, tag2);

        signal.dispatch('a');
        signal.remove(tag1);
        signal.dispatch('b');
        signal.add(listener);
        signal.remove(tag1);
        signal.remove(tag2);
        signal.dispatch('c');

        assertEquals(receivedPayloads, ['a', 'c']);
    },
);

test(
    'Signal after removing a listener by listener the tag no longer applies',
    () => {
        const receivedPayloads: string[] = [];

        const signal = new Signal<string>();

        const tag1 = {};
        const tag2 = {};

        const listener = (payload: string) => receivedPayloads.push(payload);

        signal.add(listener, tag1, tag2);

        signal.dispatch('a');
        signal.remove(listener);
        signal.dispatch('b');
        signal.add(listener);
        signal.remove(tag1);
        signal.remove(tag2);
        signal.dispatch('c');

        assertEquals(receivedPayloads, ['a', 'c']);
    },
);

test(
    'Signal after removing a tag the tag should no longer apply to multiple listeners',
    () => {
        const receivedPayloads1: string[] = [];
        const receivedPayloads2: string[] = [];

        const signal = new Signal<string>();

        const tag = {};

        const listener1 = (payload: string) => receivedPayloads1.push(payload);
        const listener2 = (payload: string) => receivedPayloads2.push(payload);

        signal.add(listener1, tag);
        signal.add(listener2, tag);

        signal.dispatch('a');
        signal.remove(tag);
        signal.dispatch('b');
        signal.add(listener1);
        signal.add(listener2);
        signal.remove(tag);
        signal.dispatch('c');

        assertEquals(receivedPayloads1, ['a', 'c']);
        assertEquals(receivedPayloads2, ['a', 'c']);
    },
);

test(
    'Signal removing a tagged listener should not affect other listeners with the same tag',
    () => {
        const receivedPayloads1: string[] = [];
        const receivedPayloads2: string[] = [];

        const signal = new Signal<string>();

        const tag = {};

        const listener1 = (payload: string) => receivedPayloads1.push(payload);
        const listener2 = (payload: string) => receivedPayloads2.push(payload);

        signal.add(listener1, tag);
        signal.add(listener2, tag);

        signal.dispatch('a');
        signal.remove(listener1);
        signal.dispatch('b');
        signal.add(listener1);
        signal.remove(tag);
        signal.dispatch('c');

        assertEquals(receivedPayloads1, ['a', 'c']);
        assertEquals(receivedPayloads2, ['a', 'b']);
    },
);

test(
    'Signal listener should be able to add again with the same tag',
    () => {
        const receivedPayloads1: string[] = [];
        const receivedPayloads2: string[] = [];

        const signal = new Signal<string>();

        const tag = {};

        const listener1 = (payload: string) => receivedPayloads1.push(payload);
        const listener2 = (payload: string) => receivedPayloads2.push(payload);

        signal.add(listener1, tag);
        signal.add(listener2, tag);
        signal.dispatch('a');
        signal.remove(tag);
        signal.dispatch('b');
        signal.add(listener1, tag);
        signal.add(listener2, tag);
        signal.dispatch('c');
        signal.remove(tag);
        signal.dispatch('d');

        assertEquals(receivedPayloads1, ['a', 'c']);
        assertEquals(receivedPayloads2, ['a', 'c']);
    },
);
