const form = document.querySelector("form");
const radioBtns = document.querySelectorAll("input[type=radio]");
const billAmount = document.querySelector("#bill-amount");
const customPercent = document.querySelector("#custom-percent");
const peopleAmount = document.querySelector("#people-amount");
const tipResult = document.querySelector("#result-tip");
const totalResult = document.querySelector("#result-total");
const resetBtn = document.querySelector(".btn.btn--reset");

// Event Listeners

const listeners = {
  "#bill-amount": {
    click: (e) => setCursorToEnd(e.target),
    keydown: (e) => {
      if (e.keyCode === 37 || e.keyCode === 39) {
        e.preventDefault();
      }
      setCursorToEnd(e.target);
    },
    focus: (e) => setCursorToEnd(e.target),
    input: (e) => {
      let value = removeNaN(e.target.value);
      if (value) {
        const dollars = parseFloat(value) / 100;
        e.target.value = formatter(dollars);
      }
      setCursorToEnd(e.target);
      checkError(e.target);
    },
  },
  "#people-amount": {
    input: (e) => {
      e.target.value = removeNaN(e.target.value);
      checkError(e.target);
    },
  },
  "#custom-percent": {
    input: (e) => {
      radioBtns.forEach((btn) => (btn.checked = false));
      e.target.value = removeNaN(e.target.value);
    },
    focusin: (e) => {
      e.target.value = "";
      e.target.classList.remove("selected");
    },
    focusout: (e) => {
      if (e.target.value) {
        e.target.classList.add("selected");
        e.target.value = e.target.value + "%";
      }
    },
  },
  ".radio-group > label": {
    keydown: (e) => {
      if (e.keyCode === 32 || e.keyCode === 13) {
        const radio = document.getElementById(e.target.getAttribute("for"));
        if (radio) radio.checked = true;
        submit();
      }
    },
  },
  "input[type='radio']": {
    change: () => {
      customPercent.classList.remove("selected");
      customPercent.value = "";
    },
  },
  input: {
    keydown: (e) => e.key === "Enter" && e.target.blur(),
    input: submit,
  },
};
// Not working inside listeners object
resetBtn.addEventListener("click", () => resetAll());

// Event Listeners Initialization

Object.entries(listeners).forEach(([selector, handlers]) => {
  Object.entries(handlers).forEach(([eventType, handler]) => {
    form.addEventListener(eventType, (e) => {
      if (e.target.matches(selector)) {
        handler(e);
      }
    });
  });
});

// Submit runs on every input

function submit() {
  const checkedRadio = document.querySelector('input[type="radio"]:checked');
  // if an input changes reset totals
  resetTotals();
  // if any input has a value, enable reset button
  updateResetButtonState();

  if (!billAmount.value || !peopleAmount.value) return;
  if (!checkedRadio && !customPercent.value) return;
  if (document.querySelectorAll(".error-active").length) return;

  const percentage = checkedRadio
    ? parseInt(checkedRadio.value)
    : parseInt(removeNaN(customPercent.value));

  const result = splitTip(
    parseFloat(billAmount.value.replace(/[^0-9.]/g, "")) || 0,
    percentage,
    parseInt(peopleAmount.value),
  );

  tipResult.textContent = result.perPersonTip;
  totalResult.textContent = result.perPersonTotal;
}

function splitTip(billAmount, tipPercentage, numPeople) {
  // initialize all variables outside of blocks
  let billCents, tipCents, totalCents, perPersonTipCents, perPersonTotalCents;
  // use cents for operations to avoid inaccurate rounding & floats
  // intentionally allow 0 in custom percentage to use app for basic cost splitting
  if (tipPercentage === 0) {
    totalCents = Math.round(billAmount * 100);
    perPersonTotalCents = Math.round(totalCents / numPeople);
    perPersonTipCents = 0;
  } else {
    billCents = Math.round(billAmount * 100);
    tipCents = Math.round((billCents * tipPercentage) / 100);
    totalCents = billCents + tipCents;

    perPersonTotalCents = Math.round(totalCents / numPeople);
    perPersonTipCents = Math.round(tipCents / numPeople);
  }

  const perPersonTotal = perPersonTotalCents / 100;
  const perPersonTip = perPersonTipCents / 100;

  return {
    perPersonTotal: formatter(perPersonTotal, "currency", "USD"),
    perPersonTip: formatter(perPersonTip, "currency", "USD"),
  };
}

function setCursorToEnd(input) {
  // force cursor to far right side on Bill Amount input to have specific $0.00 formatting
  input.setSelectionRange(input.value.length, input.value.length);
  input.focus();
}

function removeNaN(str) {
  // remove '$' and '%' from inputs
  return str.replace(/[^0-9]/g, "");
}

function formatter(str, style, currency) {
  // format $0.00 for totals and bill amount input
  const nf = new Intl.NumberFormat("en-US", {
    style,
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return nf.format(str);
}

function resetAll() {
  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.checked = false;
  });
  customPercent.value = "";
  billAmount.value = "";
  peopleAmount.value = "";
  totalResult.textContent = "$0.00";
  tipResult.textContent = "$0.00";
  customPercent.classList.remove("selected");
  resetBtn.disabled = true;
  checkError(billAmount);
  checkError(peopleAmount);
}

function resetTotals() {
  totalResult.textContent = "$0.00";
  tipResult.textContent = "$0.00";
}

function updateResetButtonState() {
  const hasValues =
    billAmount.value ||
    peopleAmount.value ||
    document.querySelector('input[type="radio"]:checked') ||
    customPercent.value;

  resetBtn.disabled = !hasValues;
}

function checkError(input) {
  let value;

  if (input.name === "bill-amount") value = parseFloat(input.value);
  else value = parseInt(input.value);

  if (value <= 0) showError(input, "Can't be zero");
  else hideError(input);
}

function showError(input, message) {
  const errorSpan = input.parentElement.querySelector(".error");
  if (errorSpan) {
    errorSpan.textContent = message;
    input.parentElement.classList.add("error-active");
  }
}

function hideError(input) {
  const errorSpan = input.parentElement.querySelector(".error");
  if (errorSpan) {
    errorSpan.textContent = "";
    input.parentElement.classList.remove("error-active");
  }
}
