define([], function () {

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

			this.console.warn('REPORTER ERROR');
			this.console.error(error);
		},

		suiteError: function (suite) {

			this.console.warn('SUITE ERROR');
			this.console.error(suite.error);
		},

		suiteStart: function (suite) {

		},

		suiteEnd: function (suite) {

		},

		testPass: function (test) {

			var testName = test[this.testId],
				timeElapsed = test.timeElapsed,
				testDetails = {
					timeElapsed: timeElapsed
				};

			this.resultDetails.pass[testName] = testDetails;
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
		},

		testSkip: function (test) {

			var testName = test[this.testId],
				testSkipReason = test.skipped,
				testDetails = {
					skipReason: testSkipReason || ''
				};

			this.resultDetails.skip[testName] = testDetails;
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
