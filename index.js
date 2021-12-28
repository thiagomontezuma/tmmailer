const express = require("express");
const cors = require("cors")
const { check } = require('express-validator');
const SibApiV3Sdk = require('sib-api-v3-sdk');
require("dotenv").config();

// Instantiate an express app
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});

// SMTP Transporter
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.API_KEY;

app.get("/", (req, res) => {
    res.send(JSON.stringify({connection:"success"}));
})

app.post("/send", [
    check('name').trim().escape(),
    check('email').isEmail().normalizeEmail(),
    check('message').trim().escape()
], (req, res) => {
    // Send Message with Appropriate Fields and Provided Information   
    new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({
        "sender": {
            "email": req.body.email,
            "name": req.body.name
        },
        "to": [
            {
                "email": req.body.toEmail,
                "name": "TMMailer"
            }
        ],
        "subject": "TMMailer - Contact Form on Homepage",
        "htmlContent": `
            <!DOCTYPE html>
            <html>
            <head></head>
            <body>
            <h4><b>Message Received by TMMailer:</b></h4>
            <b>Name:</b> <br>
            ${req.body.name} <br><br>
            <b>Email:</b> <br>
            ${req.body.email} <br><br>
            <b>Message:</b> <br> ${req.body.message}
            </body>
            </html>
        `
    }).then(function(data) {
        console.log("success", data);
        res.status(200).send(JSON.stringify({response: "Successful"}));
    }, function(error) {
        console.error("error", error);
        res.status(500).send(JSON.stringify({response: "Something went wrong."}));
    });
});
  
