function Validator(options) {
  function validate(inputElement, rule, errorElement) {
    let errorMessage = rule.test(inputElement.value);

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
      let errorElement = inputElement.parentElement.querySelector(
        options.errorSelector,
      );

      if (inputElement) {
        // Process onblur input
        inputElement.onblur = function () {
          validate(inputElement, rule, errorElement);
        };

        // Process when user prompts input
        inputElement.oninput = function () {
          errorElement.innerText = "";
          inputElement.parentElement.classList.remove("invalid");
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
    test: function (value) {
      let pattern = /^\w+('-'?\w+)*@\w+('-'?\w+)*(\.\w{2,3})+$/;
      return pattern.test(value) ? undefined : "Please fill with an email!";
    },
  };
};
