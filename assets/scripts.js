function Validator(options) {
  // Create objects to store the selector rules based on rule.selector as 'KEY'
  let selectorRules = {};

  function validate(inputElement, rule, errorElement) {
    let rules = selectorRules[rule.selector];

    let errorMessage;
    for (let i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }

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
    // Validate all input when click submit
    formElement.onsubmit = function (e) {
      e.preventDefault();
      options.rules.forEach(function (rule) {
        let inputElement = formElement.querySelector(rule.selector);
        let errorElement = inputElement.parentElement.querySelector(
          options.errorSelector,
        );
        validate(inputElement, rule, errorElement);
      });
    };

    // Process all the rules
    options.rules.forEach(function (rule) {
      if (!Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector] = [rule.test];
      } else {
        selectorRules[rule.selector].push(rule.test);
      }

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
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      let valueNoSpace = value.trim();
      return valueNoSpace ? undefined : message || "Please fill in this blank!";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      let pattern = /^\w+('-'?\w+)*@\w+('-'?\w+)*(\.\w{2,3})+$/;
      return pattern.test(value)
        ? undefined
        : message || "Please fill with an email!";
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : message || `Please use at least ${min} characters!`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmedValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmedValue()
        ? undefined
        : message || "Value is un-identical!";
    },
  };
};
