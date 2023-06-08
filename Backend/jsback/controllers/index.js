const models = require('../database/models');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


//signing a user up
//hashing users password before its saved to the database with bcrypt
const createUser = async (req, res) => {
 try {
   const { name, email, password, age, comments } = req.body;
   const data = {
     name,
     email,
     password: await bcrypt.hash(password, 10),
     age,
     comments,
   };
   console.log(data);

   //saving the user
   const user = await models.User.create(data);

   //if user details is captured
   //generate token with the user's id and the secretKey in the env file
   // set cookie with the token generated
   if (user) {
     let token = jwt.sign({ id: user.id }, process.env.secretKey, {
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
const { email, password } = req.body;

   //find a user by their email
   const user = await models.User.findOne({
     where: {
     email: email
   } 
     
   });

   //if user email is found, compare password with bcrypt
   if (user) {
     const isSame = await bcrypt.compare(password, user.password);

     //if password is the same
      //generate token with the user's id and the secretKey in the env file

     if (isSame) {
       let token = jwt.sign({ id: user.id }, process.env.secretKey, {
         expiresIn: 1 * 24 * 60 * 60 * 1000,
       });

       //if password matches wit the one in the database
       //go ahead and generate a cookie for the user
       res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
       console.log("user", JSON.stringify(user, null, 2));
       console.log(token);
       //send user data
       //return res.status(201).send(user);
       return res.status(201).send({"token": token});

     } else {
       return res.status(401).send("Authentication failed");
     }
   } else {
     return res.status(401).send("Authentication failed");
   }
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
