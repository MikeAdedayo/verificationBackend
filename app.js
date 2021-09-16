const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
// const fetch = require("node-fetch");
const client = require('twilio')("ACc680dfddf141535c3193b0310aa04de2", "a82ad2ef5d47766521e0b0d66ccf7720");

mongoose.connect("mongodb+srv://buzztechdb:buzztechdb@cluster0.wbt5l.mongodb.net/<intppltest>?retryWrites=true&w=majority");

const { Schema } = mongoose;
const VerificationSchema = new Schema({
  phone: String, // String is shorthand for {type: String}
  verificationNumber: String,
});
const UserSchema = new Schema({
  phone: String, // String is shorthand for {type: String}
});

const app = express();

app.use(bodyParser.json())

app.use(cors());

app.get("/", function (req, res) {
  res.send("hello world");
});

app.post("/verifyNumber", async function (req, res) {
    console.log(req.body);
    if(!req.body){
        res.json({ status: false, message: "Fatal error" });
    }
    if (req.body.number ) {
    const verificationModel = mongoose.model("UserVerification", VerificationSchema);
    const randomNumber = Math.floor(Math.random() * 100000);
    const verify = await verificationModel
      .findOneAndUpdate(
        { phone: req.body.number },
        { phone: req.body.number, verificationNumber: randomNumber },
        { upsert: true }
      );
      twilo(req.body.number,randomNumber);
    if (verify) {
      res.json({ status: true, message: "OK" });
    }
  }
  res.json({ status: false, message: "Number error" });
});

app.post("/confirmNumber", async function (req, res) {
    if(!req.body){
        res.json({ status: false, message: "Fatal error" });
    }
  if (req.body.number && req.body.verificationNumber) {
    const verificationModel = mongoose.model("UserVerification", VerificationSchema);
    const isNumberAvaliable = await verificationModel.findOne({
        phone: req.body.number,
    });
    if (isNumberAvaliable) {
        if (isNumberAvaliable.verificationNumber == req.body.verificationNumber) {
            
            const UserModel = mongoose.model("User", UserSchema);
        await new UserModel({phone:isNumberAvaliable.phone}).save();
            res.json({ status: true, message: "OK" });
      }
    }
    res.json({ status: false, message: "Wrong Verification Number" });
  }
  res.json({
    status: false,
    message: "Number error OR verification code error",
  });
});

async function twilo(phone,token){
    try {
  await client. messages.create({
        body:`Your token is ${token}`,
        to: `+${phone}`,
        from: "+16193046655"
    }).then(resp=>{
        console.log(resp);
    }).catch(err=>{
        console.log(err)
    })
} catch (error) {
 console.log(error)       
}
}

app.listen(3005);
