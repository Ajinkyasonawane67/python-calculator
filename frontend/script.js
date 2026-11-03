// ==========================================
// GLOBAL VARIABLES
// ==========================================

let selectedOperation = null;
let activeInput = "number1";
let startNewNumber = false;


// ==========================================
// INPUT FIELD SELECTION
// ==========================================

const number1 = document.getElementById("number1");
const number2 = document.getElementById("number2");
const result = document.getElementById("result");


// Detect when the user selects the first input
number1.addEventListener("focus", function () {
    activeInput = "number1";
});


// Detect when the user selects the second input
number2.addEventListener("focus", function () {
    activeInput = "number2";
});


// ==========================================
// NUMBER PAD FUNCTIONS
// ==========================================

// Enter a digit using the keypad
function enterDigit(digit) {
    const input = document.getElementById(activeInput);

    if (startNewNumber) {
        input.value = digit;
        startNewNumber = false;
    } else {
        input.value += digit;
    }

    input.focus();
}


// Enter a decimal point
function enterDecimal() {
    const input = document.getElementById(activeInput);

    if (startNewNumber) {
        input.value = "0.";
        startNewNumber = false;
    } else if (input.value === "") {
        input.value = "0.";
    } else if (!input.value.includes(".")) {
        input.value += ".";
    }

    input.focus();
}


// Delete the last digit
function backspace() {
    const input = document.getElementById(activeInput);

    if (startNewNumber) {
        input.value = "";
        startNewNumber = false;
    } else {
        input.value = input.value.slice(0, -1);
    }

    input.focus();
}


// ==========================================
// OPERATION SELECTION
// ==========================================

function selectOperation(operation) {

    // The first number must be entered before selecting an operation
    if (number1.value.trim() === "") {
        result.textContent = "Please enter the first number.";
        number1.focus();
        return;
    }

    // Validate the first number
    if (!Number.isFinite(Number(number1.value))) {
        result.textContent = "Please enter a valid first number.";
        number1.focus();
        return;
    }

    selectedOperation = operation;

    // Prepare the second input for a new number
    activeInput = "number2";
    startNewNumber = true;

    number2.focus();

    result.textContent = "Enter the second number.";
}


// ==========================================
// CALCULATION FUNCTIONS
// ==========================================

// Calculate using the selected keypad operation
function calculateSelectedOperation() {

    if (selectedOperation === null) {
        result.textContent = "Please select an operation first.";
        return;
    }

    calculate(selectedOperation);
}


// Perform calculation through the FastAPI backend
async function calculate(operation) {

    const aText = number1.value.trim();
    const bText = number2.value.trim();

    // Validate empty inputs
    if (aText === "" || bText === "") {
        result.textContent = "Please enter both numbers.";
        return;
    }

    const a = Number(aText);
    const b = Number(bText);

    // Validate numbers
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
        result.textContent = "Please enter valid numbers.";
        return;
    }

    // Select the backend endpoint
    const endpoints = {
        add: "/add-json",
        subtract: "/subtract-json",
        multiply: "/multiply-json",
        divide: "/divide-json"
    };

    const endpoint = endpoints[operation];

    if (!endpoint) {
        result.textContent = "Invalid operation selected.";
        return;
    }

    try {

        result.textContent = "Calculating...";

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                a: a,
                b: b
            })
        });

        const data = await response.json();

        // Display errors returned by the backend
        if (!response.ok) {
            throw new Error(
                data.detail || "Calculation failed."
            );
        }

        // Format the result to a maximum of 10 decimal places
        const formattedResult = Number(data.result.toFixed(10));

        // Display the result
        result.textContent = formattedResult;

        // Add the successful calculation to history
        addToHistory(a, b, operation, formattedResult);

        // Prepare for the next calculation
        selectedOperation = null;
        activeInput = "number1";
        startNewNumber = true;

    } catch (error) {

        console.error("Calculator error:", error);

        result.textContent =
            error.message || "Something went wrong. Please try again.";
    }
}


// ==========================================
// QUICK CALCULATION BUTTONS
// ==========================================

// The Add, Subtract, Multiply, and Divide buttons
// can call calculate(operation) directly.


// ==========================================
// CALCULATION HISTORY
// ==========================================

function addToHistory(a, b, operation, answer) {

    const history = document.getElementById("history");
    const item = document.createElement("li");

    const symbols = {
        add: "+",
        subtract: "−",
        multiply: "×",
        divide: "÷"
    };

    item.textContent =
        `${a} ${symbols[operation]} ${b} = ${answer}`;

    history.appendChild(item);
}


// Clear calculation history
function clearHistory() {
    document.getElementById("history").innerHTML = "";
}


// ==========================================
// CLEAR CALCULATOR
// ==========================================

function clearCalculator() {

    number1.value = "";
    number2.value = "";

    result.textContent = "---";

    selectedOperation = null;
    activeInput = "number1";
    startNewNumber = false;

    number1.focus();
}


// ==========================================
// KEYBOARD SUPPORT
// ==========================================

document.addEventListener("keydown", function (event) {

    // Preserve browser and operating system shortcuts
    if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }

    // Enter performs the selected calculation
    if (event.key === "Enter" && selectedOperation !== null) {
        event.preventDefault();
        calculateSelectedOperation();
    }

    // Escape clears the calculator
    if (event.key === "Escape") {
        clearCalculator();
    }

});


// ==========================================
// INITIAL PAGE SETUP
// ==========================================

window.addEventListener("load", function () {
    number1.focus();
});