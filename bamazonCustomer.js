const mysql = require("mysql");
const inquirer = require("inquirer");

var con = mysql.createConnection({
  host: "localhost",
  host: 'localhost',
  user: 'root',
  password: 'xxxxxxxxxx',
  database: 'bamazon'
});

con.connect(function(err) {
  if (err) throw err;
  getItems();
});

function getItems() {
  con.query("select * from products", function(err, res) {
    if (err) throw err;
    console.log("Available items:");
    for (let i = 0; i < res.length; i++) {
      console.log(`
      
orderItem: ${res[i].item_orderItem}
Product name: ${res[i].product_name}
Price: $${res[i].price}
-------------
      `);
      // con.end();
    }
    start();
  });
}

function start() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "item",
        message: "What is the the orderItem of the product you would like to buy?",
        valorderItemate: function(value) {
          if (isNaN(value)) {
            return false;
          } else {
            return true;
          }
        }
      },
      {
        type: "input",
        name: "quantity",
        message: "How many units of the product you would like to buy?",
        valorderItemate: function(value) {
          if (isNaN(value)) {
            return false;
          } else {
            return true;
          }
        }
      }
    ])
    .then(function(order) {
      let orderQuantity = parseInt(order.quantity);
      let orderItem = Number(order.item);
      con.query(
        "SELECT stock_quantity, price FROM products WHERE item_id = ?",
        orderItem,
        function(err, res) {
          if (err) throw err;
          let price = res[0].price;
          if (res[0].stock_quantity > orderQuantity) {
            let newQuantity = res[0].stock_quantity - orderQuantity;
            let pricePaorderItem = orderQuantity * price;
            updateDatabase(newQuantity, pricePaorderItem, orderItem);
            console.log(
              `
Success, you purchased ${orderQuantity} items for $${pricePaorderItem}
              `
            );
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "another",
                  message: "Do you want to purchase another product?",
                  choices: ["yes", "no"]
                }
              ])
              .then(function(answer) {
                if (answer.another === "yes") {
                  start();
                } else {
                  con.end();
                }
              });
          } else {
            console.log("Insufficient quantity of product, please try again");
            start();
          }
        }
      );
    });
}

function updateDatabase(newQuantity, pricePaorderItem, previousSales, orderItem) {
  con.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: newQuantity,
      },
      {
        item_orderItem: orderItem
      }
    ],
    function(err) {
      if (err) throw err;
    }
  );
}