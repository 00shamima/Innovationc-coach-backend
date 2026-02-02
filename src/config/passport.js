const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('../utils/prisma');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const user = await prisma.user.upsert({
        where: { email: email },
        update: { name: profile.displayName, profilePic: profile.photos[0]?.value },
        create: {
          name: profile.displayName,
          email: email,
          password: null, 
          role: 'USER',
          profilePic: profile.photos[0]?.value
        }
      });
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

module.exports = passport;