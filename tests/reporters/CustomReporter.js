define([
], function () {

	function Custom(config) {

		config = config || {};

		this.console = config.console;
		this.hasGrouping = 'group' in this.console && 'groupEnd' in this.console;
		this.testId = this.hasGrouping ? 'name' : 'id';

		this.resultDetails = {
			pass: {},
			fail: {},
			skip: {}
		};
	}

	Custom.prototype = {
		constructor: Custom,

		fatalError: function (error) {

			this.console.warn('FATAL ERROR');
			this.console.error(error);
		},

		reporterError: function (reporter, error) {

			this.console.error('REPORTER ERROR');
			this.console.error(error);
		},

		suiteEnd: function (suite) {

			// IE<10 does not provide a global console object when Developer Tools is turned off
			if (!this.console) {
				return;
			}

			var numTests = suite.numTests,
				numFailedTests = suite.numFailedTests,
				numSkippedTests = suite.numSkippedTests,
				message = numFailedTests + '/' + numTests + ' tests failed';

			if (numSkippedTests > 0) {
				message += ' (' + numSkippedTests + ' skipped)';
			}

			//this.console[numFailedTests ? 'warn' : 'info'](message);
			//this.hasGrouping && this.console.groupEnd(suite.name);
		},

		suiteError: function (suite) {

			if (!this.console) {
				return;
			}
			this.console.warn('SUITE ERROR');
			this.console.error(suite.error);
		},

		suiteStart: function (suite) {

			// only start group for non-root suite
			//this.hasGrouping && suite.hasParent && this.console.group(suite.name);
		},

		testFail: function (test) {

			var testName = test[this.testId],
				testError = test.error,
				timeElapsed = test.timeElapsed,
				testDetails = {
					error: testError,
					timeElapsed: timeElapsed
				};

			this.resultDetails.fail[testName] = testDetails;

			//this.console.log('FAIL: ' + testName + ' (' + timeElapsed + 'ms)');
			//this.console.error(testError);
		},

		testPass: function (test) {

			var testName = test[this.testId],
				timeElapsed = test.timeElapsed,
				testDetails = {
					timeElapsed: timeElapsed
				};

			this.resultDetails.pass[testName] = testDetails;

			//this.console.log('PASS: ' + testName + ' (' + timeElapsed + 'ms)');
		},

		testSkip: function (test) {

			var testName = test[this.testId],
				testSkipReason = test.skipped,
				testDetails = {
					skipReason: testSkipReason || ''
				};

			this.resultDetails.skip[testName] = testDetails;

			//this.console.log('SKIP: ' + testName + (testSkipReason ? ' (' + testSkipReason + ')' : ''));
		},

		runEnd: function (executor) {

		 	var passCount = Object.keys(this.resultDetails.pass).length,
				failCount = Object.keys(this.resultDetails.fail).length,
				skipCount = Object.keys(this.resultDetails.skip).length,
				summary = {
					pass: passCount,
					fail: failCount,
					skip: skipCount,
					total: passCount + failCount + skipCount
				},
				results = {
					summary: summary,
					details: this.resultDetails
				};

			this.console.log(JSON.stringify(results));
		}
	};

	return Custom;
});
