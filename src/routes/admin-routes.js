import express from 'express';
import passport from 'passport';
import xss from 'xss';
import { insertGame , getGames, getTeams } from '../lib/db.js';

export const adminRouter = express.Router();

async function indexRoute(req, res) {
  if (req.isAuthenticated()) {
    // User is logged in
    return res.render('index', {
      title: 'Welcome Back!',
      isAuthenticated: req.isAuthenticated(),
      user: req.user // Make sure this exists and has the data you expect
    });
  }
    // User is not logged in
    return res.render('login', {
      title: 'Innskráning',
    });

}

async function adminRoute(req, res) {
  const user = req.user ?? null;
  const loggedIn = req.isAuthenticated();
  const games = await getGames();
  const teams = await getTeams(); // Fetch teams here

  return res.render('admin', {
    title: 'Admin upplýsingar, mjög leynilegt',
    user,
    loggedIn,
    games,
    teams, // pass teams to template
  });
}

// TODO færa á betri stað
// Hjálpar middleware sem athugar hvort notandi sé innskráður og hleypir okkur
// þá áfram, annars sendir á /login
function ensureLoggedIn(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.redirect('/login');
  } else {
    next();
  }
}

function skraRoute(req, res, next) {
  try {
    return res.render('skra', {
      title: 'Skrá leik',
    });
  } catch(error)  {
    next(error); // express error handler
    return next(error);
  }
}

async function skraRouteInsert(req, res, next) {
  // TODO mjög hrátt allt saman, vantar validation!
  const { homeName, homeScore, awayName, awayScore } = req.body;

  try {
    // Await the insertion of the game
    await insertGame(homeName, parseInt(homeScore, 10), awayName, parseInt(awayScore, 10));
    res.redirect('/leikir'); // Redirect or handle success as needed
  } catch (error) {
      next(error);    // Handle the error
      res.redirect('/admin'); // Consider providing feedback about the error
  }
}

adminRouter.get('/login', indexRoute);
adminRouter.get('/admin', ensureLoggedIn, adminRoute);
adminRouter.get('/skra', skraRoute);
adminRouter.post('/skra', skraRouteInsert);

adminRouter.post(
  '/login',
  // login sanitize not necessary
  // Þetta notar strat að ofan til að skrá notanda inn
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureMessage: 'Notandanafn eða lykilorð vitlaust',
    successRedirect: '/admin',
  })
);
adminRouter.post('/admin/add-game', ensureLoggedIn, async (req, res) => {
  const {date} = req.body; // Assuming date handling is safe
  const home = xss(req.body.home); // Sanitize input
  const away = xss(req.body.away); // Sanitize input
  // Parse scores as integers
  const homeScore = parseInt(req.body.homeScore, 10);
  const awayScore = parseInt(req.body.awayScore, 10);

  // Check for NaN values in scores
  if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
    // Redirect back to the form with a message
    return res.status(400).send('Invalid scores provided.');
  }
  const currentDate = new Date();
  const gameDate = new Date(date);
  if (gameDate > currentDate) {
    return res.status(400).send('Game date must be in the past.');
  }
  try {
    await insertGame(date, home, away, homeScore, awayScore);
    // Redirect to the games list page or wherever appropriate
    return res.redirect('/leikir'); // Explicit return
  } catch (error) {
    console.error('Error inserting game:', error);
    // Handle the error appropriately
    res.status(500).send('An error occurred while adding the game.');
    return res.status(500).send('An error occurred while adding the game.');
  }
});
