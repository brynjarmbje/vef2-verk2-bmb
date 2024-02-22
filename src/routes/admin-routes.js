import express from 'express';
import passport from 'passport';
import { insertGame } from '../lib/db.js';
import { getGames, getTeams } from '../lib/db.js';
import ensureAuthenticated from '../auth.js';
export const adminRouter = express.Router();

async function indexRoute(req, res) {
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
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/login');
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
adminRouter.get('/admin', ensureAuthenticated ,ensureLoggedIn, adminRoute, (req, res) => {
  res.render('admin')
});
adminRouter.get('/skra', skraRoute);
adminRouter.post('/skra', skraRouteInsert);

adminRouter.post(
  '/login',

  // Þetta notar strat að ofan til að skrá notanda inn
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/login',
  }),

  // Ef við komumst hingað var notandi skráður inn, senda á /admin
  (req, res) => {
    res.redirect('/admin');
  },
);
adminRouter.post('/admin/add-game', ensureLoggedIn, async (req, res) => {
  // Destructure your form fields directly from `req.body`
  const { date, home, away } = req.body;
  // Parse scores as integers
  const home_score = parseInt(req.body.home_score, 10);
  const away_score = parseInt(req.body.away_score, 10);

  // Validation example: Check for NaN values in scores
  if (isNaN(home_score) || isNaN(away_score)) {
    // Respond with an error message or redirect back to the form with a message
    return res.status(400).send('Invalid scores provided.');
  }

  try {
    // Assuming `insertGame` is correctly implemented to handle the game insertion
    await insertGame(date, home, away, home_score, away_score);
    // Redirect to the games list page or wherever appropriate
    res.redirect('/leikir');
  } catch (error) {
    console.error('Error inserting game:', error);
    // Handle the error appropriately
    res.status(500).send('An error occurred while adding the game.');
  }
});
