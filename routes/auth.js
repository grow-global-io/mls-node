const router = require("express").Router();

const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy; // For YouTube
const TwitterStrategy = require('passport-twitter').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;
const passport = require("passport");

const LINKEDIN_CLIENT_ID = "LINKEDIN_CLIENT_ID"
const LINKEDIN_CLIENT_SECRET = "LINKEDIN_CLIENT_SECRET"
const YOUTUBE_CLIENT_ID = "YOUTUBE_CLIENT_ID"
const YOUTUBE_CLIENT_SECRET = "YOUTUBE_CLIENT_SECRET"
const TWITTER_CONSUMER_KEY = "TWITTER_CONSUMER_KEY"
const TWITTER_CONSUMER_SECRET = "TWITTER_CONSUMER_SECRET"
const INSTAGRAM_CLIENT_ID = "INSTAGRAM_CLIENT_ID"
const INSTAGRAM_CLIENT_SECRET = "INSTAGRAM_CLIENT_SECRET"
// Configure LinkedIn Strategy
passport.use(new LinkedInStrategy({
    clientID: LINKEDIN_CLIENT_ID,
    clientSecret: LINKEDIN_CLIENT_SECRET,
    callbackURL: "/linkedin/callback", // Replace with your callback URL
    scope: ['r_emailaddress', 'r_liteprofile'] // Adjust scopes as needed
  },
  function(accessToken, refreshToken, profile, done) {
    // Use profile information to create or authenticate a user in your system
    return done(null, profile);
  }
));

// Configure Google/YouTube Strategy (using OAuth 2.0)
passport.use(new GoogleStrategy({
    clientID: YOUTUBE_CLIENT_ID,
    clientSecret: YOUTUBE_CLIENT_SECRET,
    callbackURL: "/youtube/callback", // Replace with your callback URL
  },
  function(accessToken, refreshToken, profile, done) {
    // Use profile information to create or authenticate a user in your system
    return done(null, profile);
  }
));

// Express routes for LinkedIn and YouTube
router.get('/linkedin', passport.authenticate('linkedin'));
router.get('/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect or handle as needed
    res.redirect('/');
  }
);

router.get('/youtube', passport.authenticate('google', { scope: ['https://www.googleapis.com.readonly'] }));
router.get('/youtube/callback', passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect or handle as needed
    res.redirect('/');
  }
);

passport.use(new TwitterStrategy({
  consumerKey: TWITTER_CONSUMER_KEY,
  consumerSecret: TWITTER_CONSUMER_SECRET,
  callbackURL: "/twitter/callback" // Replace with your callback URL
},
function(token, tokenSecret, profile, done) {
  // Use profile information (profile.username, profile.id, etc.) to create or authenticate a user in your system
  return done(null, profile);
}
));

// Configure Instagram Strategy
passport.use(new InstagramStrategy({
  clientID: INSTAGRAM_CLIENT_ID,
  clientSecret: INSTAGRAM_CLIENT_SECRET,
  callbackURL: "instagram/callback" // Replace with your callback URL
},
function(accessToken, refreshToken, profile, done) {
  // Use profile information (profile.username, profile.id, etc.) to create or authenticate a user in your system
  return done(null, profile);
}
));

// Express routes for initiating authentication
router.get('/twitter', passport.authenticate('twitter'));
router.get('/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }),
function(req, res) {
  // Successful authentication, redirect or handle as needed
  res.redirect('/');
}
);

router.get('/instagram', passport.authenticate('instagram'));
router.get('/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }),
function(req, res) {
  // Successful authentication, redirect or handle as needed
  res.redirect('/');
}
);


// ... (other routes and configurations)

// Start the server
// (remaining code)


module.exports = router