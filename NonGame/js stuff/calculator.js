// Maximum number of significant digits to display
const MAX_DIGITS = 16;  // You can adjust this value as needed
const FACTORIAL_LIMIT = 10000;

// Function to format the result to a specified number of significant digits
function formatDisplay(value) {
  // If value is a whole number, return it as an integer
  if (Number.isInteger(value)) {
      return value.toString();
  } else {
      // If value is a decimal, format it to remove unnecessary zeros
      // Use toPrecision to limit significant digits and strip trailing zeros
      return value.toPrecision(MAX_DIGITS).replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0$/, "");
  }
}


var screen=document.querySelector('#screen');
    var btn=document.querySelectorAll('.btn');

    /*============ For getting the value of btn, Here we use for loop ============*/
    for(item of btn)
    {
        item.addEventListener('click',(e)=>{
            btntext=e.target.innerText;

            if(btntext =='×')
            {
                btntext= '*';
            }

            if(btntext=='÷')
            {
                btntext='/';
            }
            screen.value+=btntext;
        });
    }

    function sin()
    {
        screen.value=Math.sin(screen.value);
    }

    function cos()
    {
        screen.value=Math.cos(screen.value);
    }

    function tan()
    {
        screen.value=Math.tan(screen.value);
    }

    function pow()
    {
        screen.value=Math.pow(screen.value,2);        
    }

    function sqrt()
    {
        screen.value=Math.sqrt(screen.value,2);
    }

    function log()
    {
        screen.value=Math.log(screen.value);
    }

    function pi()
    {
        screen.value= 3.14159265359;
    }

    function e()
    {
        screen.value=2.71828182846;
    }

    // Function to calculate factorial
    function fact() {
        let expression = document.getElementById("screen").value;
        let number = parseFloat(expression);

        if (isNaN(number) || number < 0 || !Number.isInteger(number)) {
            // If the input is not a valid number or negative or not an integer, show an error
            document.getElementById("screen").value = "Error";
            return;
        }

        // Check if the number exceeds the factorial limit
        if (number > FACTORIAL_LIMIT) {
            // If it's too large, prevent the operation and show an error
            document.getElementById("screen").value = `Limit exceeded`;
            return;
        }

        // Calculate factorial if within the allowed range
        let result = factorial(number);
        document.getElementById("screen").value = result;
        addToHistory(`${expression}! = ${result}`);
    }

    // Function to calculate factorial recursively
    function factorial(n) {
        if (n === 0 || n === 1) {
            return 1;
        }
        return n * factorial(n - 1);
    }

    function backspc()
    {
        screen.value=screen.value.substr(0,screen.value.length-1);
    }

// Add the calculation to history
function addToHistory(calculation) {
  let history = JSON.parse(localStorage.getItem("calcHistory")) || [];
  history.push(calculation);
  if (history.length > 5) { // Limit to last 5 results
      history.shift(); // Remove the oldest
  }
  localStorage.setItem("calcHistory", JSON.stringify(history));
  displayHistory();
}

// Display the calculation history in the modal
function displayHistory() {
  const historyList = document.getElementById("history-list");
  historyList.innerHTML = ''; // Clear previous history

  let history = JSON.parse(localStorage.getItem("calcHistory")) || [];
  history.forEach(function (item) {
      const li = document.createElement("li");
      li.textContent = item;
      historyList.appendChild(li);
  });
}

// Calculate the expression
function calculate() {
  let expression = document.getElementById("screen").value;
  if (expression) {
      try {
          let result = eval(expression);
          result = formatDisplay(result);  // Format the result before displaying it
          document.getElementById("screen").value = result;
          addToHistory(`${expression} = ${result}`);
      } catch (e) {
          document.getElementById("screen").value = "Error";
      }
  }
}

// Open the history modal
document.getElementById("settings-link").addEventListener("click", function (e) {
  e.preventDefault();
  document.getElementById("history-modal").style.display = "block";
});

// Close the history modal
document.getElementById("close-modal").addEventListener("click", function () {
  document.getElementById("history-modal").style.display = "none";
});

// Close the modal when clicking outside
window.addEventListener("click", function (e) {
  if (e.target === document.getElementById("history-modal")) {
      document.getElementById("history-modal").style.display = "none";
  }
});

// On page load, display the history if it exists
window.onload = function () {
  displayHistory();
};

// Add event listener for the Enter key to trigger calculation
document.getElementById("screen").addEventListener("keydown", function (event) {
  // If Enter is pressed
  if (event.key === "Enter") {
      event.preventDefault();  // Prevent default action (form submit or other)
      calculate();  // Trigger the calculation
  }

  // If the 'x' key is pressed, replace it with '*'
  if (event.key === "x") {
    event.preventDefault();  // Prevent the 'x' from being typed
    let screenValue = document.getElementById("screen").value;
    document.getElementById("screen").value = screenValue + "*";  // Append '*' instead of 'x'
  }

  if (event.key === "Escape") {
    event.preventDefault();  // Prevent default action
    document.getElementById("screen").value = "";  // Clear the screen (AC)
  }


});