define([
	'intern',
	'intern/chai!assert',
	'intern!object'
], function (
	intern,
	assert,
	registerSuite
){
	var basePath = intern.config.dynamicRequirePath,
		fullPath = basePath + '/' + intern.args.pathToCode,
		filePath = fullPath + '/' + "delivery",
		codeToTest;

	registerSuite(function () {

		return {
			name: 'Add testing',

			setup: function () {

				var dfd = this.async(1000);

				require([
					filePath
				], function (code) {

					codeToTest = code;
					dfd.resolve();
				});
			},

			'Suma de dos naturales': function () {

				assert.strictEqual(codeToTest.main(2,2), 7, "La suma de 2+2 no da 7.");
				assert.strictEqual(codeToTest.main(2,3), 5, "La suma de 2+3 no da 5.");
			},

			'Suma de dos negativos': function () {

				assert.strictEqual(codeToTest.main(-2,-2), -4, "La suma de (-2)+(-2) no da -4.");
			}
		};
	});
});
