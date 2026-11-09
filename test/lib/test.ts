import assert from 'node:assert/strict';
import nodeTest from 'node:test';

type TestContext = {
    deepEqual(actual: unknown, expected: unknown, message?: string): void;
    equal(actual: unknown, expected: unknown, message?: string): void;
    false(actual: unknown, message?: string): void;
    end(): void;
};

type TestCallback = (context: TestContext) => void | Promise<void>;

const context: TestContext = {
    deepEqual(actual, expected, message) {
        assert.deepStrictEqual(actual, expected, message);
    },
    equal(actual, expected, message) {
        assert.strictEqual(actual, expected, message);
    },
    false(actual, message) {
        assert.strictEqual(actual, false, message);
    },
    end() {
        // Native test functions finish when their callback returns.
    },
};

export default function test(name: string, callback: TestCallback): void {
    nodeTest(name, () => callback(context));
}
