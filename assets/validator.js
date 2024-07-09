function Validator(formOptions) {
  function getParentBySelector(element, selector) {
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
      getParentBySelector(
        inputElement,
        formOptions.formGroupSelectors,
      ).classList.add("invalid");
    } else {
      errorElement.innerText = "";
      getParentBySelector(
        inputElement,
        formOptions.formGroupSelectors,
      ).classList.remove("invalid");
    }

    // Valid --> return undefined --> !errorMessage = true
    return !errorMessage;
  }

  let formElement = document.querySelector(formOptions.form);
  if (formElement) {
    // Validate all input when click submit
    formElement.onsubmit = function (e) {
      e.preventDefault();

      let isFormValid = true;

      formOptions.rules.forEach(function (rule) {
        let inputElement = formElement.querySelector(rule.selector);
        let errorElement = getParentBySelector(
          inputElement,
          formOptions.formGroupSelectors,
        ).querySelector(formOptions.errorSelector);

        let isValid = validate(inputElement, rule, errorElement);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        if (typeof formOptions.onSubmit === "function") {
          let validInputElement = formElement.querySelectorAll("[name]");
          let validInputValues = Array.from(validInputElement).reduce(function (
            output,
            currInput,
          ) {
            switch (currInput.type) {
              case "radio":
                output[currInput.name] = formElement.querySelector(
                  'input[name="' + currInput.name + '"]:checked',
                ).value;
                break;

              case "checkbox":
                if (currInput.matches(":checked")) {
                  output[currInput.name] = [];
                  return output;
                }

                if (!Array.isArray(output[currInput.name])) {
                  output[currInput.name] = [];
                }
                output[currInput.name].push(currInput.value);
                break;

              case "file":
                output[currInput.name] = currInput.files;
                break;

              default:
                output[currInput.name] = currInput.value;
            }
            return output;
          }, {});
          formOptions.onSubmit(validInputValues);
        } else {
          formElement.submit();
        }
      }
    };

    // Process all the rules
    formOptions.rules.forEach(function (rule) {
      if (!Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector] = [rule.test];
      } else {
        selectorRules[rule.selector].push(rule.test);
      }

      let inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach(function (inputElement) {
        let errorElement = getParentBySelector(
          inputElement,
          formOptions.formGroupSelectors,
        ).querySelector(formOptions.errorSelector);

        inputElement.onblur = function () {
          validate(inputElement, rule, errorElement);
        };

        // Process when user prompts input
        inputElement.oninput = function () {
          errorElement.innerText = "";
          getParentBySelector(
            inputElement,
            formOptions.formGroupSelectors,
          ).classList.remove("invalid");
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
