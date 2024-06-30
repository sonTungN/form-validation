function Validator(options) {
  let formElement = document.querySelector(options.form);
}

Validator.isRequired = function (selector) {
  return {
    selector: selector,
    test: function () {},
  };
};

Validator.isEmail = function (selector) {
  return {
    selector: selector,
    test: function () {},
  };
};
