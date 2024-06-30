function Validator(options) {
  function validate(inputElement, rule) {
    let errorMessage = rule.test(inputElement.value);
    let errorElement =
      inputElement.parentElement.querySelector(".form-message");

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      inputElement.parentElement.classList.add("invalid");
    } else {
      errorElement.innerText = "";
      inputElement.parentElement.classList.remove("invalid");
    }
  }

  let formElement = document.querySelector(options.form);

  if (formElement) {
    options.rules.forEach(function (rule) {
      let inputElement = formElement.querySelector(rule.selector);
      if (inputElement) {
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };
      }
    });
  }
}

// General Rule:
// 1. Invalid --> Display message
// 2. Valid --> return undefined
Validator.isRequired = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      let valueNoSpace = value.trim();
      return valueNoSpace ? undefined : "Please fill in this blank!";
    },
  };
};

Validator.isEmail = function (selector) {
  return {
    selector: selector,
    test: function () {},
  };
};
