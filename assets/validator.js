function Validator(formSelector, options = {}) {
  let formRules = {};

  // Invalid --> Display error message
  // Valid --> undefined
  let validateRules = {
    required: function (value) {
      return value ? undefined : "Please fill in this input!";
    },

    email: function (value) {
      let pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return pattern.test(value) ? undefined : "Must input an email!";
    },

    min: function (min) {
      return function (value) {
        return value.length >= min
          ? undefined
          : `Input must be at least ${min} characters`;
      };
    },

    max: function (max) {
      return function (value) {
        return value.length <= max
          ? undefined
          : `Input at max ${max} characters`;
      };
    },
  };

  let formElement = document.querySelector(formSelector);

  if (formElement) {
    let inputs = formElement.querySelectorAll("[name][rules]");

    for (let input of inputs) {
      let rules = input.getAttribute("rules").split("|");

      for (let rule of rules) {
        let isRuleHasValue = rule.includes(":");
        let ruleInfo;

        if (rule.includes(":")) {
          ruleInfo = rule.split(":");
          rule = ruleInfo[0];
        }

        let ruleFunction = validateRules[rule];
        if (isRuleHasValue) {
          ruleFunction = ruleFunction(ruleInfo[1]);
        }

        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunction);
        } else {
          formRules[input.name] = [ruleFunction];
        }
      }

      // Process Event for validation
      input.onblur = handleValidate;
      input.oninput = handleClearError;
    }

    // Validating function
    function handleValidate(event) {
      let rules = formRules[event.target.name];
      let errorMessage;

      // Find through rules until get the invalid in rule() and
      // return the error message

      for (let rule of rules) {
        errorMessage = rule(event.target.value);
        if (errorMessage) break;
      }

      if (errorMessage) {
        let formGroup = getParent(event.target, ".form-group");

        if (formGroup) {
          let formMessage = formGroup.querySelector(".form-message");
          if (formMessage) {
            formMessage.innerText = errorMessage;
            formGroup.classList.add("invalid");
          }
        }
      }
      return !errorMessage;
    }
  }

  function handleClearError(event) {
    let formGroup = getParent(event.target, ".form-group");
    if (formGroup.classList.contains("invalid")) {
      formGroup.classList.remove("invalid");

      let formMessage = formGroup.querySelector(".form-message");
      if (formMessage) {
        formMessage.innerText = "";
      }
    }
  }

  function getParent(element, selector) {
    let parent = element.parentElement;
    while (parent) {
      if (parent.matches(selector)) {
        return parent;
      }
      parent = parent.parentElement;
    }
  }

  formElement.onsubmit = function (event) {
    event.preventDefault();

    let inputs = formElement.querySelectorAll("[name][rules]");
    let isFormValid = true;

    for (let input of inputs) {
      if (!handleValidate({ target: input })) {
        isFormValid = false;
      }
    }

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

  // console.log(formRules);
}
