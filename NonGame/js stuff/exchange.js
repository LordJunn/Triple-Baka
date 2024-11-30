// DOM Elements
const currencyEl_one = document.getElementById('currency-one');
const amountEl_one = document.getElementById('amount-one');
const currencyEl_two = document.getElementById('currency-two');
const amountEl_two = document.getElementById('amount-two');
const currencyEl_three = document.getElementById('currency-three');
const amountEl_three = document.getElementById('amount-three');
const currencyEl_four = document.getElementById('currency-four');
const amountEl_four = document.getElementById('amount-four');
const currencyEl_five = document.getElementById('currency-five');
const amountEl_five = document.getElementById('amount-five');
const rateEl = document.getElementById('rate');
const swap = document.getElementById('swap');

// API key for the ExchangeRate-API
const apiKey = 'a87e754fcaa18e836d425400';  // Replace with your actual API key

// Fetch and populate the currency dropdown options
async function loadCurrencies() {
  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/codes`);
    const data = await response.json();

    if (data.result === "success") {
      const currencyList = data.supported_codes;  // List of currency codes

      // Populate the currency dropdowns
      currencyList.forEach(([currencyCode, currencyName]) => {
        const optionOne = new Option(currencyName + " (" + currencyCode + ")", currencyCode);
        const optionTwo = new Option(currencyName + " (" + currencyCode + ")", currencyCode);
        const optionThree = new Option(currencyName + " (" + currencyCode + ")", currencyCode);
        const optionFour = new Option(currencyName + " (" + currencyCode + ")", currencyCode);
        const optionFive = new Option(currencyName + " (" + currencyCode + ")", currencyCode);

        currencyEl_one.add(optionOne);
        currencyEl_two.add(optionTwo);
        currencyEl_three.add(optionThree);
        currencyEl_four.add(optionFour);
        currencyEl_five.add(optionFive);
      });
    } else {
      console.error("Error fetching currency data:", data.error_type);
    }
  } catch (error) {
    console.error("Error fetching currencies:", error);
  }

  // Set default values and initial calculation
  currencyEl_one.value = 'USD';
  currencyEl_two.value = 'MYR';
  currencyEl_three.value = 'SGD';
  currencyEl_four.value = 'EUR';
  currencyEl_five.value = 'GBP';

  updateCurrencyOptions();  // Ensure options are updated based on current selection
  calculate();  // Initial calculation
}

// Function to remove conflicting currencies from other dropdowns
function updateCurrencyOptions() {
  const selectedCurrencies = [
    currencyEl_one.value,  // currency 1
    currencyEl_two.value,  // currency 2
    currencyEl_three.value,  // currency 3
    currencyEl_four.value,  // currency 4
    currencyEl_five.value   // currency 5
  ];

  // Helper function to update a dropdown (currency 3, 4, 5) based on exclusion of certain currencies
  function updateDropdown(dropdown, excludeCurrencies) {
    const allOptions = Array.from(dropdown.options);
    // Remove options that are in the excludeCurrencies list
    allOptions.forEach(option => {
      if (excludeCurrencies.includes(option.value)) {
        option.style.display = 'none';  // Hide the conflicting option
      } else {
        option.style.display = '';  // Show the option
      }
    });
  }

  // Update the dropdowns to hide conflicting currencies
  updateDropdown(currencyEl_one, selectedCurrencies);
  updateDropdown(currencyEl_two, selectedCurrencies);
  updateDropdown(currencyEl_three, selectedCurrencies);
  updateDropdown(currencyEl_four, selectedCurrencies);
  updateDropdown(currencyEl_five, selectedCurrencies);
}

// Function to calculate and update the exchange rates
function calculate() {
  const currency_one = currencyEl_one.value;
  const currency_two = currencyEl_two.value;
  const currency_three = currencyEl_three.value;
  const currency_four = currencyEl_four.value;
  const currency_five = currencyEl_five.value;

  fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${currency_one}`)
    .then(res => res.json())
    .then(data => {
      if (data.result === "success") {
        // Get the exchange rates between selected currencies
        const rate1 = data.conversion_rates[currency_two];
        const rate2 = data.conversion_rates[currency_three];
        const rate3 = data.conversion_rates[currency_four];
        const rate4 = data.conversion_rates[currency_five];

        // Update the rates for all currencies
        rateEl.innerText = `1 ${currency_one} = ${rate1} ${currency_two}, ${rate2} ${currency_three}, ${rate3} ${currency_four}, ${rate4} ${currency_five}`;

        // Update the amount fields for currencies 2, 3, 4, and 5
        amountEl_two.value = (amountEl_one.value * rate1).toFixed(2);
        amountEl_three.value = (amountEl_one.value * rate2).toFixed(2);
        amountEl_four.value = (amountEl_one.value * rate3).toFixed(2);
        amountEl_five.value = (amountEl_one.value * rate4).toFixed(2);
      } else {
        console.error("Error fetching exchange rates:", data.error_type);
      }
    })
    .catch(error => console.error("Error fetching exchange rate data:", error));
}

// Swap currencies
swap.addEventListener('click', () => {
  const temp = currencyEl_one.value;
  currencyEl_one.value = currencyEl_two.value;
  currencyEl_two.value = temp;

  updateCurrencyOptions();  // Update available options after swapping
  calculate();
});

// Event listeners for changes in currency or amount
currencyEl_one.addEventListener('change', () => {
  updateCurrencyOptions();  // Update available options when currency 1 changes
  calculate();
});
amountEl_one.addEventListener('input', calculate);
currencyEl_two.addEventListener('change', () => {
  updateCurrencyOptions();  // Update available options when currency 2 changes
  calculate();
});
amountEl_two.addEventListener('input', calculate);
currencyEl_three.addEventListener('change', () => {
  updateCurrencyOptions();  // Update available options when currency 3 changes
  calculate();
});
amountEl_three.addEventListener('input', calculate);
currencyEl_four.addEventListener('change', () => {
  updateCurrencyOptions();  // Update available options when currency 4 changes
  calculate();
});
amountEl_four.addEventListener('input', calculate);
currencyEl_five.addEventListener('change', () => {
  updateCurrencyOptions();  // Update available options when currency 5 changes
  calculate();
});
amountEl_five.addEventListener('input', calculate);

// Load currencies when the page loads
window.onload = () => {
  loadCurrencies();
  calculate();  // Initial calculation
};
