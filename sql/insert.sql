INSERT INTO users (name, username, password, admin) VALUES ('Brynjar admin', 'bmbadmin', '$2b$10$1jKq4x8FhRt0fIdKoTf4xu0GekuynLxM3JAycNH6aCDkO2tZdUC56', true);
INSERT INTO users (name, username, password) VALUES ('Halli', 'halli', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');
INSERT INTO users (name, username, password) VALUES ('Jón', 'jon', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');
INSERT INTO users (name, username, password) VALUES ('Hybba', 'hoho', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');

INSERT INTO teams (name) VALUES ('Boltaliðið');
INSERT INTO teams (name) VALUES ('Dripplararnir');
INSERT INTO teams (name) VALUES ('Skotföstu kempurnar');
INSERT INTO teams (name) VALUES ('Markaskorarnir');
INSERT INTO teams (name) VALUES ('Sigurliðið');
INSERT INTO teams (name) VALUES ('Risaeðlurnar');
INSERT INTO teams (name) VALUES ('Framherjarnir');
INSERT INTO teams (name) VALUES ('Fljótu fæturnir');
INSERT INTO teams (name) VALUES ('Vinningshópurinn');
INSERT INTO teams (name) VALUES ('Ósigrandi skotfólkið');
INSERT INTO teams (name) VALUES ('Óhemjurnar');
INSERT INTO teams (name) VALUES ('Hraðaliðið');

INSERT INTO games (home, away, home_score, away_score) VALUES (2, 11, 3, 5);
INSERT INTO games (home, away, home_score, away_score) VALUES (3, 9, 1, 0);
INSERT INTO games (home, away, home_score, away_score) VALUES (8, 12, 5, 2);
INSERT INTO games (home, away, home_score, away_score) VALUES (7, 4, 2, 2);
INSERT INTO games (home, away, home_score, away_score) VALUES (6, 11, 1, 4);
INSERT INTO games (home, away, home_score, away_score) VALUES (1, 5, 2, 3);
INSERT INTO games (home, away, home_score, away_score) VALUES (10, 4, 2, 0);
INSERT INTO games (home, away, home_score, away_score) VALUES (1, 5, 1, 3);
INSERT INTO games (home, away, home_score, away_score) VALUES (8, 11, 3, 5);

UPDATE users SET password = '$2b$10$1jKq4x8FhRt0fIdKoTf4xu0GekuynLxM3JAycNH6aCDkO2tZdUC56' WHERE username = 'bmbadmin';
