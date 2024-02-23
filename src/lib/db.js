import pg from 'pg';
import { environment } from './environment.js';
import { logger } from './logger.js';

const env = environment(process.env, logger);

if (!env?.connectionString) {
  process.exit(-1);
}

const { connectionString } = env;

const pool = new pg.Pool({ connectionString });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

export async function query(q, values = []) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('Unable to get client from pool', e);
    throw e; // Rethrow or handle error appropriately
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    console.error('Unable to query', e);
    console.info('Query:', q, 'Values:', values);
    throw e; // Rethrow the error to handle it in the calling function
  } finally {
    client.release();
  }
}

export async function getGames() {
  try {
    const q = `
      SELECT
        games.date,
        home_team.name AS "homeName",
        games.home_score AS "homeScore",
        away_team.name AS "awayName",
        games.away_score AS "awayScore"
      FROM
        games
      LEFT JOIN
        teams AS home_team ON home_team.id = games.home
      LEFT JOIN
        teams AS away_team ON away_team.id = games.away
    `;

    const result = await query(q);

    const games = [];

    if (result && (result.rows?.length ?? 0) > 0) {
      for (const row of result.rows) {
        const game = {
          date: row.date,
          home: {
            name: row.homeName,
            score: row.homeScore,
          },
          away: {
            name: row.awayName,
            score: row.awayScore,
          },
        };
        games.push(game);
      }
    }
    // Returns games array
    return games;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

export async function getStandings() {
  const queryText = `
    SELECT
      teams.id,
      teams.name,
      COUNT(games.id) AS "played",
      COUNT(CASE WHEN (games.home = teams.id AND games.home_score > games.away_score) OR
                      (games.away = teams.id AND games.away_score > games.home_score) THEN 1 END) AS "wins",
      COUNT(CASE WHEN (games.home = teams.id AND games.home_score < games.away_score) OR
                      (games.away = teams.id AND games.away_score < games.home_score) THEN 1 END) AS "losses",
      SUM(CASE WHEN games.home = teams.id THEN games.home_score ELSE games.away_score END) AS "goalsFor",
      SUM(CASE WHEN games.home = teams.id THEN games.away_score ELSE games.home_score END) AS "goalsAgainst",
      3 * COUNT(CASE WHEN (games.home = teams.id AND games.home_score > games.away_score) OR
                          (games.away = teams.id AND games.away_score > games.home_score) THEN 1 END) AS "points"
    FROM
      teams
    LEFT JOIN games ON games.home = teams.id OR games.away = teams.id
    GROUP BY teams.id
    ORDER BY "points" DESC,
             (SUM(CASE WHEN games.home = teams.id THEN games.home_score ELSE games.away_score END) -
              SUM(CASE WHEN games.home = teams.id THEN games.away_score ELSE games.home_score END)) DESC,
             SUM(CASE WHEN games.home = teams.id THEN games.home_score ELSE games.away_score END) DESC,
             teams.name;
  `;
  try {
    const result = await query(queryText);
    return result.rows;
  } catch (error) {
    console.error('Error fetching standings:', error);
    throw error; // Ensure the error is thrown so it can be caught by the caller
  }
}

export async function getTeams() {
  const queryText = 'SELECT id, name FROM teams ORDER BY name;';
  try {
    const result = await query(queryText);
    return result.rows;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error; // It's important to throw the error so the calling function can handle it
  }
}

export async function insertGame(date, home, away, homeScore, awayScore) {
  const q = `INSERT INTO games (date, home, away, home_score, away_score)
            VALUES ($1, $2, $3, $4, $5);`;
  const values = [date, home, away, homeScore, awayScore];

  try {
      await query(q, values);
  } catch (error) {
      console.error('Error inserting game:', error);
      throw error; // Rethrow or handle as needed
  }
}

export async function end() {
  await pool.end();
}
