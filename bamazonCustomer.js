const mysql = require("mysql");
const inquirer = require("inquirer");

var con = mysql.createConnection({
  host: "localhost",
  host: 'localhost',
  user: 'root',
  password: 'Completeview!',
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
        name: "item",
        type: "input",
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
        name: "quantity",
        type: "input",
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
            updateDatabase(newQuantity, orderItem);
            console.log(
              `
You purchased ${orderQuantity} item(s) for total price $${pricePaorderItem}
              `
            );
            inquirer
              .prompt([
                {
                  name: "another",
                  type: "confirm",
                  message: "Do you want to purchase another product?",
                  choices: ["yes", "no"]
                  
                }
                
              ])
              .then(function(answer) {
                console.log(answer);
                if (answer.another !== "yes") {
                  console.log(answer);
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

function updateDatabase(newQuantity, orderItem) {
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