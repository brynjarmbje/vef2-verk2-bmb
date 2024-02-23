import express from 'express';
import passport from 'passport';
import { insertGame } from '../lib/db.js';
import { getGames, getTeams } from '../lib/db.js';
import xss from 'xss';
export const adminRouter = express.Router();

async function indexRoute(req, res) {
  if (req.isAuthenticated()) {
    // User is logged in
    return res.render('index', {
      title: 'Welcome Back!',
      isAuthenticated: req.isAuthenticated(),
      user: req.user // Make sure this exists and has the data you expect
    });
  } else {
    // User is not logged in
    return res.render('login', {
      title: 'Innskráning',
    });
  }
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
  return res.render('skra', {
    title: 'Skrá leik',
  });
}

async function skraRouteInsert(req, res, next) {
  // TODO mjög hrátt allt saman, vantar validation!
  const { home_name, home_score, away_name, away_score } = req.body;

  try {
    // Await the insertion of the game
    await insertGame(home_name, parseInt(home_score, 10), away_name, parseInt(away_score, 10));
    res.redirect('/leikir'); // Redirect or handle success as needed
  } catch (error) {
    console.error('Error inserting game:', error);
    // Handle the error, possibly by rendering the form again with an error message
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
  const date = req.body.date; // Assuming date handling is safe
  const home = xss(req.body.home); // Sanitize input
  const away = xss(req.body.away); // Sanitize input
  // Parse scores as integers
  const home_score = parseInt(req.body.home_score, 10);
  const away_score = parseInt(req.body.away_score, 10);

  // Check for NaN values in scores
  if (isNaN(home_score) || isNaN(away_score)) {
    // Redirect back to the form with a message
    return res.status(400).send('Invalid scores provided.');
  }

  try {
    await insertGame(date, home, away, home_score, away_score);
    // Redirect to the games list page or wherever appropriate
    res.redirect('/leikir');
  } catch (error) {
    console.error('Error inserting game:', error);
    // Handle the error appropriately
    res.status(500).send('An error occurred while adding the game.');
  }
});
