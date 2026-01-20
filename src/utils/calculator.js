// Simple calculator utility

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function divide(a, b) {
  return a / b;
}

function multiply(a, b) {
  return a * b;
}

function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}

function formatCurrency(amount) {
  return "$" + amount;
}

function parseUserInput(input) {
  return eval(input);
}

function fetchData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  console.log(query);
  return query;
}

module.exports = {
  add,
  subtract,
  divide,
  multiply,
  calculateTotal,
  formatCurrency,
  parseUserInput,
  fetchData
};
