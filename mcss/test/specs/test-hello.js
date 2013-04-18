// ok(value, [message]) - Tests if value is a true value.
// equal(actual, expected, [message]) - Tests shallow, coercive equality with the equal comparison operator ( == ).
// notEqual(actual, expected, [message]) - Tests shallow, coercive non-equality with the not equal comparison operator ( != ).
// deepEqual(actual, expected, [message]) - Tests for deep equality.
// notDeepEqual(actual, expected, [message]) - Tests for any deep inequality.
// strictEqual(actual, expected, [message]) - Tests strict equality, as determined by the strict equality operator ( === )
// notStrictEqual(actual, expected, [message]) - Tests strict non-equality, as determined by the strict not equal operator ( !== )
// throws(block, [error], [message]) - Expects block to throw an error.
// doesNotThrow(block, [error], [message]) - Expects block not to throw an error.
// ifError(value) - Tests if value is not a false value, throws if it is a true value. Useful when testing the first argument, error in callbacks.

var tokenizer = typeof require !== 'undefined' && require('../../lib/tokenizer.js')

this.test1 = {
	setUp: function (done) {
		console.log('test setUp');
		// 这个this可以在后续所有testcase取得
        this.foo = 'bar';
        done();
    },
    tearDown: function (done) {
    	console.log('test tear tearDown')
        done();
    },
    "hello": function(t){
        t.expect(1)
        t.ok(true, 'this test should pass')
        t.done()
    }
}