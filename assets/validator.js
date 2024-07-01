function Validator(formSelector) {
  let formRules = {};

  // Invalid --> Display error message
  // Valid --> undefined
  let validateRules = {
    required: function (value) {
      return value ? undefined : "Please fill in this input!";
    },

    email: function (value) {
      let pattern = /^w+([.-]?w+)*@w+([.-]?w+)*(.w{2,3})+$/;
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
    }

    // Validating function
  }
  // console.log(formRules);
}
