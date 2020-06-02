
const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const users = require("./data");
const uuid = require("uuid");

router.use(bodyParser.json());

function userNameExists(req, res, next){
    const username = req.body.username;
    let coincidence = users.findIndex(user => user.username === username);
    console.log(coincidence);

    if (coincidence == -1) {
        next();
    } else{
        res.status(400).json({err: "User already exists"});
    }
}

function userIDExists(req, res, next){
    let userID = req.params.id;
    let index = users.findIndex(find => find.id == userID);
    req.params.foundIndex = index; // Index saved as parameter
    if (index == -1) {
        res.status(402).json({err: "User not found"});
    }
    else{
        next();
    }
}

function checkCredentials(req, res, next){
    const {username, password} = req.body;
    let check = users.findIndex(user => user.username === username && user.password === password);
    
    if (check == -1) {
        res.status(404).json({err: "User credentials nor found. Please try again."});
    } else{
        next();
    }
}

function recipientExists(req, res, next){
    let transferee = req.params.to_recipient;
    let index = users.findIndex(user => user.id == transferee);
    req.params.transferIndex = index;

    if (index == -1) {
        res.status(404).json({err: "User (transferee) not found"});
    } else{
        next();
    }
}

// View all existing users
router.get("/users", (req, res) =>{
    res.json(users);
})

// Sign new users
router.post("/signup", userNameExists, (req, res) =>{
    req.body.id = uuid.v4();
    users.push(req.body);
    res.status(200).json({msg: "Succesful"})
});

// Log in based on username
router.post("/login", userNameExists, checkCredentials, (req, res) =>{
    res.status(200).json({msg: "Log In succesful"});
});

router.get("/users/:id", userIDExists, (req, res) =>{
    let index = req.params.foundIndex;
    res.status(202).json(users[index]);
})

// Admin console for viewing each user
router.get("/users/:id/admin", userIDExists, (req, res) =>{
    let index = req.params.foundIndex;
    res.json(
        {
            msg: "This is the admin console. The requested user is:",
            user: users[index]
        });
})

// Adding money to an account
router.post("/users/:id/admin/:acc_value", userIDExists, (req, res) =>{
    let index = req.params.foundIndex;
    let acc_value = req.params.acc_value;
    users[index].acc_value = parseFloat(acc_value);

    res.json(users[index]);
})

// Wiring module
router.get("/users/:id/wire", userIDExists, (req, res) =>{
    let index = req.params.foundIndex;
    res.json(
        {
            msg: "This is the wiring module. The requested user is:",
            user: users[index]
        });
})

// Transfering money 
router.post("/users/:id/wire/:amount/:to_recipient", userIDExists, recipientExists, (req, res) =>{
    let index = req.params.foundIndex;
    let wiredAmount = req.params.amount;
    let wireRecipient = req.params.transferIndex;

    if (users[index].acc_value == 0) {
        res.json({msg: "Insuficient funds"})
    } else{
        users[index].acc_value = users[index].acc_value - wiredAmount;
        users[wireRecipient].acc_value = parseFloat(users[wireRecipient].acc_value + wiredAmount);
        res.status(200).json({acc_value: users[index].acc_value});
    }
});

module.exports = router;