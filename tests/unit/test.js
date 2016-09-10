define([
  'intern',
  'intern/chai!assert',
  'intern!object',
  'intern/dojo/node!../../codes/alu0100'
], function (
  intern,
  assert,
  registerSuite,
  codeToTest
){

  registerSuite(function () {
    console.log("requerido", codeToTest);

    return {
      name: 'Test student code',

      setup: function () {
      },

      'Test the code': function () {
        assert.strictEqual(codeToTest.main(), 1);
      }
    };
  });
});