//importing modules
const express = require("express");
const db = require("../database/models");
//Assigning db.users to User variable
 const User = db.User;
var jwt = require('jsonwebtoken');

// const saveUser = async (req, res, next) => {

const validateToken = async (req, res, next) => {
	// check header or url parameters or post parameters for token
//    res.setHeader('Access-Control-Allow-Origin', '*');
//    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
//    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    //res.setHeader('Access-Control-Allow-Credentials', true); // If needed

try

{
    var token = req.body.token ||
	 			req.query.token ||
	 			req.headers['x-access-token'];
	// decode token
    if (token)	{
		// verifies secret and checks up
      console.log(token);
      console.log(process.env.secretKey);
	    jwt.verify(token, process.env.secretKey, function (err, decoded) {
			if (err) {
				//return res.json({success: false, message : 'Failed to authenticate token' });
				return res.status(403).send( {
					success: false, 
					message : 'Failed to authenticate token' 
				});

			} else {

				console.log('sucess ');
				console.log(decoded);

                                next();

			// is everything is good, save to request for use in other routes
		/*	User.findOne({_id : mongoose.Types.ObjectId(decoded.uid) }, function(error, obj){
					if(error){
						res.json(responseFormater(false, {}, "Invalid user. Sorry."));
						return;
					}
					req.user = obj;
					next();
				}); */
			}
		});

      } else {  // no token
		// if there is not token, return an error

		return res.status(403).send( {
			success: false,
			message: 'No token provided'
		});
	}

 } catch (error) {
   console.log(error);
 }

};


//Function to check if username or email already exist in the database
//this is to avoid having two users with the same username and email
const saveUser = async (req, res, next) => {
 //search the database to see if user exist
 try {
   const username = await User.findOne({
     where: {
       name: req.body.name,
     },
   });
   //if username exist in the database respond with a status of 409
   if (username) {
     return res.status(409).json({ "user_error" : "username already taken" } );
     // return res.status(500).json({error: error.message });
   }

   //checking if email already exist
   const emailcheck = await User.findOne({
     where: {
       email: req.body.email,
     },
   });

   //if email exist in the database respond with a status of 409
   if (emailcheck) {
     return res.status(409).json({ "email_error": "email already taken" } );

   }

   next();
 } catch (error) {
   console.log(error);
 }
};

//exporting module
 module.exports = {
 saveUser,
 validateToken,	 
};
