function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  // Create objects to store the selector rules based on rule.selector as 'KEY'
  let selectorRules = {};

  function validate(inputElement, rule, errorElement) {
    let rules = selectorRules[rule.selector];

    let errorMessage;
    for (let i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "checkbox":
        case "radio":
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ":checked"),
          );
          break;

        default:
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelectors).classList.add(
        "invalid",
      );
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelectors).classList.remove(
        "invalid",
      );
    }

    // Valid --> return undefined --> !errorMessage = true
    return !errorMessage;
  }

  let formElement = document.querySelector(options.form);

  if (formElement) {
    // Validate all input when click submit
    formElement.onsubmit = function (e) {
      e.preventDefault();

      let isFormValid = true;

      options.rules.forEach(function (rule) {
        let inputElement = formElement.querySelector(rule.selector);
        let errorElement = getParent(
          inputElement,
          options.formGroupSelectors,
        ).querySelector(options.errorSelector);
        let isValid = validate(inputElement, rule, errorElement);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        if (typeof options.onSubmit === "function") {
          let validPromptInput = formElement.querySelectorAll("[name]");
          let validFormValues = Array.from(validPromptInput).reduce(function (
            updatingValue,
            currentInput,
          ) {
            switch (currentInput.type) {
              case "radio":
                updatingValue[currentInput.name] = formElement.querySelector(
                  'input[name="' + currentInput.name + '"]:checked',
                ).value;
                break;

              case "checkbox":
                if (currentInput.matches(":checked")) {
                  updatingValue[currentInput.name] = [];
                  return updatingValue;
                }

                if (!Array.isArray(updatingValue[currentInput.name])) {
                  updatingValue[currentInput.name] = [];
                }
                updatingValue[currentInput.name].push(currentInput.value);
                break;

              case "file":
                updatingValue[currentInput.name] = currentInput.files;
                break;

              default:
                updatingValue[currentInput.name] = currentInput.value;
            }
            return updatingValue;
          }, {});
          options.onSubmit(validFormValues);
        } else {
          formElement.submit();
        }
      }
    };

    // Process all the rules
    options.rules.forEach(function (rule) {
      if (!Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector] = [rule.test];
      } else {
        selectorRules[rule.selector].push(rule.test);
      }

      let inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach(function (inputElement) {
        let errorElement = getParent(
          inputElement,
          options.formGroupSelectors,
        ).querySelector(options.errorSelector);

        inputElement.onblur = function () {
          validate(inputElement, rule, errorElement);
        };

        // Process when user prompts input
        inputElement.oninput = function () {
          errorElement.innerText = "";
          getParent(inputElement, options.formGroupSelectors).classList.remove(
            "invalid",
          );
        };
      });
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
      // let valueNoSpace = value.trim();
      return value ? undefined : message || "Please fill in this blank!";
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
