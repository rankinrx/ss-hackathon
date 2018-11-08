/**
 * TODO:
 * 1) Clean up error handling on middleware
 * 2) Standardize result outputs on each route
 * 3) add authentication to device routes
 */

/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const dashbaordController = require('./controllers/dashboard');

const userController = require('./controllers/user');
const orgController = require('./controllers/organization');
const athleteController = require('./controllers/athlete');
const deviceController = require('./controllers/device');
const notificationController = require('./controllers/notification');
const weightController = require('./controllers/weight');

const apiController = require('./controllers/api');


/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(process.env.MONGODB_URIR);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
// app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true, //  force session save every time 
  saveUninitialized: true,  // Forces a session that is "uninitialized" to be saved to the store
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true,
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    next();
  } else {
    lusca.csrf({ cookie: "cookieName" })(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  // IF no user data & you did not login & did not signup & your not an API => return to last viewed page 
  if (!req.user
    && req.path !== '/login'
    && req.path !== '/signup'
    && !req.path.match(/^\/auth/)
    && !req.path.match(/\./)) {
    req.session.returnTo = req.originalUrl;
  } else if (req.user && (req.path === '/Dashboard/account' || req.path.match(/^\/api/))) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});
app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jquery/dist'), { maxAge: 31557600000 }));
app.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));

/**
 * Primary Site Page routes (Login not required)
 */
app.get('/', homeController.index);
app.get('/contact', homeController.getContact);
app.post('/contact', homeController.postContact);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/api', apiController.getApi);

/**
 *  Dashboard Page routes (Login required)
 */
app.get('/Dashboard/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/Dashboard/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/Dashboard/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/Dashboard/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);

app.get('/Dashboard/Overview',
  passportConfig.isAuthenticated,
  deviceController.findByOrg,
  athleteController.findByOrg,
  weightController.findByAthleteStack,
  notificationController.findByAthleteStack,
  dashbaordController.getOverviewPage);
  
app.get('/Dashboard/Athletes',
  passportConfig.isAuthenticated,
  athleteController.findByOrg,
  weightController.findByAthleteStack,
  dashbaordController.getAthletesPage);

app.post('/Dashboard/Athletes',
  passportConfig.isAuthenticated,
  athleteController.new,
  dashbaordController.postAthletesPage);

app.get('/Dashboard/Athlete/:id',
  passportConfig.isAuthenticated,
  athleteController.findById,
  weightController.findByAthleteStack,
  notificationController.findByAthleteStack,
  dashbaordController.getAthleteProfilePage);
app.post('/Dashboard/Athlete/:id',
  passportConfig.isAuthenticated,
  athleteController.updateById,
  dashbaordController.postAthleteProfilePage);
app.get('/Dashboard/Athlete/:id/weight',
  passportConfig.isAuthenticated,
  athleteController.findById,
  weightController.findByAthleteStack,
  dashbaordController.getWeightPage);
app.get('/Dashboard/Settings',
  passportConfig.isAuthenticated,
  dashbaordController.getSettingsPage);
app.post('/Dashboard/Settings',
  passportConfig.isAuthenticated,
  orgController.update,
  dashbaordController.postSettingsPage);


  /**
 * Dashboard API routes.
 */
app.post('/Dashboard/api/org/select/:id',
  passportConfig.isAuthenticated,
  orgController.updateCurrentOrg);
app.post('/Dashboard/api/athlete/:id/delete',
  passportConfig.isAuthenticated,
  athleteController.deleteById,
  weightController.deleteByAthleteId,
  notificationController.deleteByAthleteId,
  dashbaordController.deleteAthlete);
app.post('/Dashboard/api/athletes/delete',
  passportConfig.isAuthenticated,
  athleteController.findByOrg,
  weightController.deleteByAthleteStack,
  notificationController.deleteByAthleteStack,
  athleteController.deleteByOrg,
  dashbaordController.deleteAthlete);
app.post('/Dashboard/api/notification/:id/delete',
  passportConfig.isAuthenticated,
  notificationController.deleteById,
  dashbaordController.deleteNotification);
app.post('/Dashboard/api/device/new',
  passportConfig.isAuthenticated,
  deviceController.new);

/**
 *  Primary Device routes.
 */

app.get('/Device/:id/io/:authType/:authId/:wt',
  deviceController.findById,
  athleteController.findByAuthType,
  weightController.findByIo,
  deviceController.ioWeightCalc,
  weightController.new,
  notificationController.new,
  deviceController.resNewWeight);
app.get('/Device/:id/s/:authType/:authId/:wt',
  deviceController.findById,
  athleteController.findByAuthType,
  deviceController.sWeightCalc,
  weightController.new,
  deviceController.resNewWeight);


/**
 * API routes.
 */
app.get('/api/upload', apiController.getFileUpload);
app.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);




/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
