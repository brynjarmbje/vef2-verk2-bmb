import express from 'express';
import { getGames, getStandings } from '../lib/db.js';


export const indexRouter = express.Router();

async function indexRoute(req, res) {
  return res.render('index', {
    title: 'Forsíða',
    time: new Date().toISOString(),
  });
}

async function leikirRoute(req, res) {
  const games = await getGames();

  return res.render('leikir', {

    title: 'Leikir',
    games,
    time: new Date().toISOString(),
  });
}

async function stadaRoute(req, res) {
  try {
    const standings = await getStandings();
    res.render('stada', {
      title: 'Staðan í deildinni',
      standings,
    });
  } catch (error) {
    console.error('Error fetching standings:', error);
    res.status(500).send('Error fetching standings');
  }
}

indexRouter.get('/', indexRoute);
indexRouter.get('/leikir', leikirRoute);
indexRouter.get('/stada', stadaRoute);
