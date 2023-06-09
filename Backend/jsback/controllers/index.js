const models = require('../database/models');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


//signing a user up
//hashing users password before its saved to the database with bcrypt
const createUser = async (req, res) => {
 try {
   const { id, email, secret_key } = req.body;
   const data = {
     id: id,
     email: email,
     conversation: [],
     request_status: false,
     current_data: null,
     current_service: null
   };
   console.log(data);

   //saving the user
   const user = await models.User.create(data);

   //if user details is captured
   //generate token with the user's id and the secretKey in the env file
   // set cookie with the token generated
   if (user) {
     let token = jwt.sign({ id: user.id }, secret_key, {
       expiresIn: 1 * 24 * 60 * 60 * 1000,
     });

     res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
     console.log("user", JSON.stringify(user, null, 2));
     console.log(token);
     //send users details
     return res.status(201).send(user);
   } else {
     return res.status(409).send("Details are not correct");
   }
 } catch (error) {
   console.log(error);
 }
};


//login authentication

const login = async (req, res) => {
 try {
// In a real scenario, you would validate the user's credentials here
const { id, email, secret_key } = req.body;

console.log('Estoy haciendo Login - NodeJS');

const user = {
  id: id,
  username: email,
  conversation: [],
  request_status: false,
  current_data: null,
  current_service: null
};

let token = jwt.sign({ id: user.id }, secret_key, {
  expiresIn: 1 * 24 * 60 * 60 * 1000,
});

  res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
       console.log("user", JSON.stringify(user, null, 2));
       console.log(token);
       //send user data
       //return res.status(201).send(user);
       return res.status(201).send({"token": token});
 } catch (error) {
   console.log(error);
 }
};



const createLog = async(req, res) => { 
  try {
    console.log(req.body);
    const mylog = await models.Log.create(req.body);
    return res.status(201).json({
      mylog
    });
  } 
  catch (error) {
    return res.status(500).json({error: error.message });
  }
};

const getAllLogs = async(req, res) => { 
  console.log('getting logs');
  try {
    const logs = await models.Log.findAll(
      {
        include : []
      }
    );
    return res.status(200).json({
      logs
    });
  } 
  catch (error) {
    return res.status(500).json({error: error.message });
  }

};


const getAllUsers = async(req, res) => { 
  console.log('getting users');
  try {
    const users = await models.User.findAll(
      {
        include : []
      }
    );
    return res.status(200).json({
      users
    });
  } 
  catch (error) {
    return res.status(500).json({error: error.message });
  }

};

module.exports = {
  login,
  createUser,
  getAllUsers,
  createLog,
  getAllLogs,	
}
