/**
 * "Static notendagrunnur"
 * Notendur eru harðkóðaðir og ekkert hægt að breyta þeim.
 * Ef við notum notendagagnagrunn, t.d. í postgres, útfærum við leit að notendum
 * hér, ásamt því að passa upp á að lykilorð séu lögleg.
 */

import bcrypt from 'bcrypt';
import { query } from './db.js';
const records = [
  {
    id: 1,
    username: 'bmbadmin',
    name: 'Hr. admin',

    // 123
    password: '1234',
    admin: true,
  },
  {
    id: 2,
    username: 'brynjar',
    name: 'Brynjar',

    // 123
    password: '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii',
    admin: false,
  },
];

export async function comparePasswords(password, user) {
  const ok = await bcrypt.compare(password, user.password);
  if (ok) {
    return user;
  }
  return false;
}

// Merkjum sem async þó ekki verið að nota await, þar sem þetta er notað í
// app.js gerir ráð fyrir async falli
export async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';
  const result = await query(q, [username]);
  if (result.rows.length > 0) {
    return result.rows[0];
  }
  return null;
}

// Merkjum sem async þó ekki verið að nota await, þar sem þetta er notað í
// app.js gerir ráð fyrir async falli
export async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';
  const result = await query(q, [id]);
  if (result.rows.length > 0) {
    return result.rows[0];
  }
  return null;
}
