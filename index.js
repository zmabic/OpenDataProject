const { Pool } = require('pg');
const express = require('express');
const path = require('path');
const app = express();

const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'NFLdatabase',
    password: 'lalelilolu',
    port: 5432,
});

app.post('/', async (req, res) => {
    console.log("Check7");
    await setResult("", "");
    console.log("Check8");
    res.sendFile(path.join(__dirname, 'index.html'));
});


async function setResult(attribute, text) {
    if (attribute == "") {
        csvQuery = 'COPY ( SELECT CAST(t.id AS VARCHAR(10)) AS team_id, t.name, t.city, t.conference, t.division, CAST(s.gamesWon AS VARCHAR(10)) AS gamesWon, CAST(s.gamesLost AS VARCHAR(10)) AS gamesLost, CAST(s.pointsScoredByTeam AS VARCHAR(10)) AS pointsScoredByTeam, CAST(s.pointsScoredByOpposition AS VARCHAR(10)) AS pointsScoredByOpposition, CAST(s.pointsDifferential AS VARCHAR(10)) AS pointsDifferential, s.coach, CAST(s.season AS VARCHAR(10)) AS season, p.firstName as playerFirstName, p.lastName as playerLastName FROM  NFLteamSeason as s INNER JOIN  player_season AS ps ON (ps.team_id = s.teamID AND ps.season = s.season) INNER JOIN  NFLplayer AS p ON ps.player_id = p.id INNER JOIN NFLteam AS t ON ps.team_id = t.id) TO \'C:\\Users\\Korisnik\\Desktop\\Razno\\ORlabos\\result1.csv\' WITH CSV HEADER';
        jsonQuery = 'COPY ( SELECT jsonb_build_object(\'NFLteamsSeasons\', json_agg(row_to_json(t))) FROM ( SELECT t.id, t.name, t.city, t.conference, t.division, s.gamesWon, s.gamesLost, s.pointsScoredByTeam, s.pointsScoredByOpposition, s.pointsDifferential, s.coach, s.season, (SELECT json_agg(row_to_json(p)) FROM player_season as ps JOIN NFLplayer AS p ON ps.player_id = p.id WHERE ps.team_id = t.id AND ps.season = s.season) AS players FROM NFLteamSeason as s JOIN NFLteam AS t ON s.teamID = t.id GROUP BY t.id, s.gamesWon, s.gamesLost, s.pointsScoredByTeam, s.pointsScoredByOpposition, s.pointsDifferential, s.coach, s.season ORDER BY s.season) AS t) TO \'C:\\Users\\Korisnik\\Desktop\\Razno\\ORlabos\\result.json\'';

        try {
            await pool.query(csvQuery);
            await pool.query(jsonQuery);
        } catch (error) {
            console.error('Error during CSV and JSON generation:', error);
        } 
        return;
    } else if (attribute == 'playername') {
        console.log("Check3");
        csvQuery = `COPY ( SELECT CAST(t.id AS VARCHAR(10)) AS team_id, t.name, t.city, t.conference, t.division, CAST(s.gamesWon AS VARCHAR(10)) AS gamesWon, CAST(s.gamesLost AS VARCHAR(10)) AS gamesLost, CAST(s.pointsScoredByTeam AS VARCHAR(10)) AS pointsScoredByTeam, CAST(s.pointsScoredByOpposition AS VARCHAR(10)) AS pointsScoredByOpposition, CAST(s.pointsDifferential AS VARCHAR(10)) AS pointsDifferential, s.coach, CAST(s.season AS VARCHAR(10)) AS season, p.firstName as playerFirstName, p.lastName as playerLastName FROM  NFLteamSeason as s INNER JOIN  player_season AS ps ON (ps.team_id = s.teamID AND ps.season = s.season) INNER JOIN  NFLplayer AS p ON ps.player_id = p.id INNER JOIN NFLteam AS t ON ps.team_id = t.id WHERE LOWER(p.firstname) = LOWER(\'${text}\') or LOWER(p.lastname) = LOWER(\'${text}\')) TO \'C:\\Users\\Korisnik\\Desktop\\Razno\\ORlabos\\result1.csv\' WITH CSV HEADER`;
        jsonQuery = 'COPY ( SELECT jsonb_build_object(\'NFLteamsSeasons\', json_agg(row_to_json(t))) FROM ( SELECT t.id, t.name, t.city, t.conference, t.division, s.gamesWon, s.gamesLost, s.pointsScoredByTeam, s.pointsScoredByOpposition, s.pointsDifferential, s.coach, s.season, (SELECT json_agg(row_to_json(p)) FROM player_season as ps JOIN NFLplayer AS p ON ps.player_id = p.id WHERE ps.team_id = t.id AND ps.season = s.season AND (LOWER(p.firstname) = LOWER(\'${text}\') or LOWER(p.lastname) = LOWER(\'${text}\'))) AS players FROM NFLteamSeason as s JOIN NFLteam AS t ON s.teamID = t.id GROUP BY t.id, s.gamesWon, s.gamesLost, s.pointsScoredByTeam, s.pointsScoredByOpposition, s.pointsDifferential, s.coach, s.season ORDER BY s.season) AS t) TO \'C:\\Users\\Korisnik\\Desktop\\Razno\\ORlabos\\result.json\'';

    } else if (attribute == 'teamname') {
        console.log("Check4");
        csvQuery = `COPY ( SELECT CAST(t.id AS VARCHAR(10)) AS team_id, t.name, t.city, t.conference, t.division, CAST(s.gamesWon AS VARCHAR(10)) AS gamesWon, CAST(s.gamesLost AS VARCHAR(10)) AS gamesLost, CAST(s.pointsScoredByTeam AS VARCHAR(10)) AS pointsScoredByTeam, CAST(s.pointsScoredByOpposition AS VARCHAR(10)) AS pointsScoredByOpposition, CAST(s.pointsDifferential AS VARCHAR(10)) AS pointsDifferential, s.coach, CAST(s.season AS VARCHAR(10)) AS season, p.firstName as playerFirstName, p.lastName as playerLastName FROM  NFLteamSeason as s INNER JOIN  player_season AS ps ON (ps.team_id = s.teamID AND ps.season = s.season) INNER JOIN  NFLplayer AS p ON ps.player_id = p.id INNER JOIN NFLteam AS t ON ps.team_id = t.id  WHERE LOWER(name) = LOWER(${text}) or LOWER(city) = LOWER(${text})) TO \'C:\\Users\\Korisnik\\Desktop\\Razno\\ORlabos\\result1.csv\' WITH CSV HEADER`;
        jsonQuery = `COPY ( SELECT jsonb_build_object(\'NFLteamsSeasons\', json_agg(row_to_json(t))) FROM ( SELECT t.id, t.name, t.city, t.conference, t.division, s.gamesWon, s.gamesLost, s.pointsScoredByTeam, s.pointsScoredByOpposition, s.pointsDifferential, s.coach, s.season, (SELECT json_agg(row_to_json(p)) FROM player_season as ps JOIN NFLplayer AS p ON ps.player_id = p.id WHERE ps.team_id = t.id AND ps.season = s.season AND (LOWER(name) = LOWER(${text}) or LOWER(city) = LOWER(${text}))) AS players FROM NFLteamSeason as s JOIN NFLteam AS t ON s.teamID = t.id GROUP BY t.id, s.gamesWon, s.gamesLost, s.pointsScoredByTeam, s.pointsScoredByOpposition, s.pointsDifferential, s.coach, s.season ORDER BY s.season) AS t) TO \'C:\\Users\\Korisnik\\Desktop\\Razno\\ORlabos\\result.json\'`;

    } else if (attribute == 'conference') {
        console.log("Check4");
        var temp = ` WHERE LOWER(conference) = LOWER(${text}) or LOWER(division) = LOWER(${text}) `;
        csvQuery = `COPY ( SELECT CAST(t.id AS VARCHAR(10)) AS team_id, t.name, t.city, t.conference, t.division, CAST(s.gamesWon AS VARCHAR(10)) AS gamesWon, CAST(s.gamesLost AS VARCHAR(10)) AS gamesLost, CAST(s.pointsScoredByTeam AS VARCHAR(10)) AS pointsScoredByTeam, CAST(s.pointsScoredByOpposition AS VARCHAR(10)) AS pointsScoredByOpposition, CAST(s.pointsDifferential AS VARCHAR(10)) AS pointsDifferential, s.coach, CAST(s.season AS VARCHAR(10)) AS season, p.firstName as playerFirstName, p.lastName as playerLastName FROM  NFLteamSeason as s INNER JOIN  player_season AS ps ON (ps.team_id = s.teamID AND ps.season = s.season) INNER JOIN  NFLplayer AS p ON ps.player_id = p.id INNER JOIN NFLteam AS t ON ps.team_id = t.id  WHERE LOWER(conference) = LOWER(${text}) or LOWER(division) = LOWER(${text})) TO \'C:\\Users\\Korisnik\\Desktop\\Razno\\ORlabos\\result1.csv\' WITH CSV HEADER`;
        jsonQuery = `COPY ( SELECT jsonb_build_object(\'NFLteamsSeasons\', json_agg(row_to_json(t))) FROM ( SELECT t.id, t.name, t.city, t.conference, t.division, s.gamesWon, s.gamesLost, s.pointsScoredByTeam, s.pointsScoredByOpposition, s.pointsDifferential, s.coach, s.season, (SELECT json_agg(row_to_json(p)) FROM player_season as ps JOIN NFLplayer AS p ON ps.player_id = p.id WHERE ps.team_id = t.id AND ps.season = s.season AND (LOWER(conference) = LOWER(${text}) or LOWER(division) = LOWER(${text}))) AS players FROM NFLteamSeason as s JOIN NFLteam AS t ON s.teamID = t.id GROUP BY t.id, s.gamesWon, s.gamesLost, s.pointsScoredByTeam, s.pointsScoredByOpposition, s.pointsDifferential, s.coach, s.season ORDER BY s.season) AS t) TO \'C:\\Users\\Korisnik\\Desktop\\Razno\\ORlabos\\result.json\'`;

    } else if (attribute == 'wildcard') {
        console.log("Check5");
        csvQuery = `COPY ( SELECT CAST(t.id AS VARCHAR(10)) AS team_id, t.name, t.city, t.conference, t.division, CAST(s.gamesWon AS VARCHAR(10)) AS gamesWon, CAST(s.gamesLost AS VARCHAR(10)) AS gamesLost, CAST(s.pointsScoredByTeam AS VARCHAR(10)) AS pointsScoredByTeam, CAST(s.pointsScoredByOpposition AS VARCHAR(10)) AS pointsScoredByOpposition, CAST(s.pointsDifferential AS VARCHAR(10)) AS pointsDifferential, s.coach, CAST(s.season AS VARCHAR(10)) AS season, p.firstName as playerFirstName, p.lastName as playerLastName FROM  NFLteamSeason as s INNER JOIN  player_season AS ps ON (ps.team_id = s.teamID AND ps.season = s.season) INNER JOIN  NFLplayer AS p ON ps.player_id = p.id INNER JOIN NFLteam AS t ON ps.team_id = t.id WHERE LOWER(conference) = LOWER(\'${text}\') or LOWER(division) = LOWER(\'${text}\') or LOWER(name) = LOWER(\'${text}\') or LOWER(city) = LOWER(\'${text}\') OR LOWER(p.firstName) = LOWER(\'${text}\') OR LOWER(p.lastname) = LOWER(\'${text}\') OR LOWER(coach) = LOWER(\'${text}\')) TO \'C:\\Users\\Korisnik\\Desktop\\Razno\\ORlabos\\result1.csv\' WITH CSV HEADER`;
        jsonQuery = `COPY ( SELECT jsonb_build_object(\'NFLteamsSeasons\', json_agg(row_to_json(t))) FROM ( SELECT t.id, t.name, t.city, t.conference, t.division, s.gamesWon, s.gamesLost, s.pointsScoredByTeam, s.pointsScoredByOpposition, s.pointsDifferential, s.coach, s.season, (SELECT json_agg(row_to_json(p)) FROM player_season as ps JOIN NFLplayer AS p ON ps.player_id = p.id WHERE ps.team_id = t.id AND ps.season = s.season AND (LOWER(conference) = LOWER(\'${text}\') or LOWER(division) = LOWER(\'${text}\') or LOWER(name) = LOWER(\'${text}\') or LOWER(city) = LOWER(\'${text}\') OR LOWER(p.firstName) = LOWER(\'${text}\') OR LOWER(p.lastname) = LOWER(\'${text}\') OR LOWER(coach) = LOWER(\'${text}\'))) AS players FROM NFLteamSeason as s JOIN NFLteam AS t ON s.teamID = t.id GROUP BY t.id, s.gamesWon, s.gamesLost, s.pointsScoredByTeam, s.pointsScoredByOpposition, s.pointsDifferential, s.coach, s.season ORDER BY s.season) AS t) TO \'C:\\Users\\Korisnik\\Desktop\\Razno\\ORlabos\\result.json\'`;
    }
    try {
        await pool.query(csvQuery);
        await pool.query(jsonQuery);
    } catch (error) {
        console.error('Error during CSV and JSON generation:', error);
    }
}

app.post('/submitForm', async (req, res) => {
    var baseQuery = 'SELECT CAST(t.id AS VARCHAR(10)) AS team_id, t.name as teamName, t.city, t.conference, t.division, CAST(gamesWon AS VARCHAR(10)) AS gamesWon, CAST(gamesLost AS VARCHAR(10)) AS gamesLost, CAST(pointsScoredByTeam AS VARCHAR(10)) AS pointsScoredByTeam, CAST(pointsScoredByOpposition AS VARCHAR(10)) AS pointsScoredByOpposition, CAST(pointsDifferential AS VARCHAR(10)) AS pointsDifferential, coach, CAST(s.season AS VARCHAR(10)) AS season, firstName as playerName, lastName as playerLastName FROM NFLteamSeason as s INNER JOIN player_season AS ps ON (ps.team_id = s.teamID AND ps.season = s.season) INNER JOIN NFLplayer AS p ON ps.player_id = p.id INNER JOIN NFLteam AS t ON ps.team_id = t.id';
    try {
        const attribute = req.body.attribute;
        const keyword = req.body.tekst;
        console.log(req.body);

        if (attribute == 'playername') {
            baseQuery += ' WHERE LOWER(firstName) = LOWER($1) or LOWER(lastName) = LOWER($1)';
        } else if (attribute == 'teamname') {
            baseQuery += ' WHERE LOWER(t.name) = LOWER($1) or LOWER(t.city) = LOWER($1)';
        } else if (attribute == 'conference') {
            baseQuery += ' WHERE LOWER(conference) = LOWER($1) or LOWER(division) = LOWER($1)';
        } else if (attribute == 'wildcard') {
            baseQuery += `WHERE LOWER(conference) = LOWER(\'${keyword}\') or LOWER(division) = LOWER(\'${keyword}\') or LOWER(name) = LOWER(\'${keyword}\') or LOWER(city) = LOWER(\'${keyword}\') OR LOWER(p.firstName) = LOWER(\'${keyword}\') OR LOWER(p.lastname) = LOWER(\'${keyword}\') OR LOWER(coach) = LOWER(\'${keyword}\')`;
        }
        await setResult(attribute, keyword);
        const result = await pool.query(baseQuery, [keyword]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
