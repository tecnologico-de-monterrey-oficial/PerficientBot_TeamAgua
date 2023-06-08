const { Router } = require('express');
const controllers = require('../controllers');
const userAuth = require('../middleware/userAuth')
const dateTime = require('../controllers/dateTime');
const conversation = require('../controllers/conversation');


// Imports
const axios = require('axios');

const { port, openai, getCurrentDateAndHour } = require('../functions/imports');

const chatbot = require('../functions/chatbot');
const devops = require('../functions/devops');
const github = require('../functions/github');
const outlook = require('../functions/outlook');

const router = Router();

// router.get('/', (req, res) => res.send('Welcome'));

// users services
router.post('/users', userAuth.saveUser,  controllers.createUser);
router.get('/users', userAuth.validateToken,  controllers.getAllUsers);

// logs services
router.post('/logs', userAuth.validateToken,  controllers.createLog);
router.get('/logs',  userAuth.validateToken,  controllers.getAllLogs);


//login route
router.post('/login', controllers.login )


//chatbot route
router.post('/chat', userAuth.validateToken, conversation);

router.get('/dateTime', dateTime);

module.exports = router;

