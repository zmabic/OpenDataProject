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

app.get('/datatable', (req, res) => {
    console.log("Ulazak u database.html");
    res.sendFile(path.join(__dirname, "datatable.html"));
});

app.post('/', async (req, res) => {
    await setJsonResult("wildcard", "");
    await setCsvResult("wildcard", "");
    res.sendFile(path.join(__dirname, 'index.html'));
});


async function setCsvResult(attribute, keyword) {
    var baseQuery = `SELECT 
                        CAST(t.team_id AS VARCHAR(10)) AS team_id, 
                        teamName, 
                        city, 
                        conference, 
                        division, 
                        CAST(gamesWon AS VARCHAR(10)) AS gamesWon, 
                        CAST(gamesLost AS VARCHAR(10)) AS gamesLost, 
                        CAST(pointsScoredByTeam AS VARCHAR(10)) AS pointsScoredByTeam, 
                        CAST(pointsScoredByOpposition AS VARCHAR(10)) AS pointsScoredByOpposition, 
                        CAST(pointsDifferential AS VARCHAR(10)) AS pointsDifferential, 
                        coach, 
                        CAST(s.season AS VARCHAR(10)) AS season,
                        p.player_id, 
                        playerFirstName, 
                        playerLastName 
                    FROM NFLteamSeason as s 
                        INNER JOIN player_season AS ps 
                        ON (ps.team_id = s.teamID AND ps.season = s.season) 
                        INNER JOIN NFLplayer AS p 
                        ON ps.player_id = p.player_id 
                        INNER JOIN NFLteam AS t 
                        ON ps.team_id = t.team_id`;
    if(keyword !== '') {
            if(attribute == 'wildcard') {   // pretrazivanje svega
                if(!isNaN(parseInt(keyword))) {
                    baseQuery += `  WHERE t.team_id = ${keyword}
                                    OR p.player_id = ${keyword}
                                    OR gamesWon = ${keyword}
                                    OR gamesLost = ${keyword}
                                    OR pointsScoredByTeam = ${keyword}
                                    OR pointsScoredByOpposition = ${keyword}
                                    OR pointsDifferential = ${keyword}
                                    OR s.season = ${keyword}`
                } else {
                    baseQuery += ` WHERE
                               LOWER(teamName) LIKE LOWER(\'%${keyword}%\')
                               OR LOWER(city) LIKE LOWER(\'%${keyword}%\')
                               OR LOWER(playerFirstName) LIKE LOWER(\'%${keyword}%\')
                               OR LOWER(playerLastName) LIKE LOWER(\'%${keyword}%\')
                               OR LOWER(conference) LIKE LOWER(\'%${keyword}%\')
                               OR LOWER(division) LIKE LOWER(\'%${keyword}%\')
                               OR LOWER(coach) LIKE LOWER(\'%${keyword}%\')`
                }
            } else if(attribute == 'gamesWon' || attribute == 'gamesLost' || attribute == 'pointsScoredByTeam'
                || attribute == 'pointsScoredByOpposition' || attribute == 'pointsDifferential' 
                || attribute == 's.season' || attribute == 't.team_id' || attribute == 'p.player_id') {
                    // slucaj kada se trazi neki broj - mora biti tocan broj
                    if(!isNaN(parseInt(keyword))) {
                        baseQuery += ` WHERE ${attribute} = ${keyword}`;
                    } else {
                        baseQuery += ` WHERE FALSE `
                    }
            } else {    // slucaj kada se trazi string - dovoljan je dio stringa
                    if(isNaN(parseInt(keyword))) {
                        baseQuery += ` WHERE LOWER(${attribute}) LIKE LOWER(\'%${keyword}%\')`;
                    } else {
                        baseQuery += ` WHERE FALSE `
                    }
            }
            try {
                await pool.query('COPY ( ' + baseQuery + ' ) TO \'C:\\Users\\Korisnik\\Desktop\\NOVO\\ORlabosNovo\\or-main\\or-main\\result1.csv\' WITH CSV HEADER');
            } catch (error) {
                console.error('Error prilikom pretvaranja baseQuery u csv.', error);
            }
            
        } else {
            await pool.query('COPY ( ' + baseQuery + ' ) TO \'C:\\Users\\Korisnik\\Desktop\\NOVO\\ORlabosNovo\\or-main\\or-main\\result1.csv\' WITH CSV HEADER');
        }
}

async function setJsonResult(attribute, text) {
    // inicijalizacija pocetka queryja
    let jsonQuery = `COPY ( 
        SELECT
            COALESCE(
                jsonb_build_object('NFLteamsSeasons', CASE WHEN count(*) = 0 THEN '[]'::json ELSE json_agg(row_to_json(t)) END),
                '[]'::jsonb
            ) AS result
        FROM (
            SELECT
                t.team_id,
                t.teamName,
                t.city,
                t.conference,
                t.division,
                s.gamesWon,
                s.gamesLost,
                s.pointsScoredByTeam,
                s.pointsScoredByOpposition,
                s.pointsDifferential,
                s.coach,
                s.season,
                COALESCE(json_agg(row_to_json(p)), '[]'::json)::json AS players
            FROM NFLteamSeason AS s
            JOIN NFLteam AS t ON s.teamID = t.team_id
            LEFT JOIN player_season AS ps ON ps.team_id = t.team_id AND ps.season = s.season
            LEFT JOIN NFLplayer AS p ON ps.player_id = p.player_id `;
    if(attribute == 'wildcard') {                            // pretrazuje sve
        if(!isNaN(parseInt(text))) {
            jsonQuery += `  WHERE t.team_id = ${text}
                            OR p.player_id = ${text}
                            OR gamesWon = ${text}
                            OR gamesLost = ${text}
                            OR pointsScoredByTeam = ${text}
                            OR pointsScoredByOpposition = ${text}
                            OR pointsDifferential = ${text}
                            OR s.season = ${text} `;
        } else {
            jsonQuery += ` WHERE
                            LOWER(teamName) LIKE LOWER(\'%${text}%\')
                            OR LOWER(city) LIKE LOWER(\'%${text}%\')
                            OR LOWER(playerFirstName) LIKE LOWER(\'%${text}%\')
                            OR LOWER(playerLastName) LIKE LOWER(\'%${text}%\')
                            OR LOWER(conference) LIKE LOWER(\'%${text}%\')
                            OR LOWER(division) LIKE LOWER(\'%${text}%\')
                            OR LOWER(coach) LIKE LOWER(\'%${text}%\') `;
        }
    } else {
        if(attribute == 'gamesWon' || attribute == 'gamesLost' || attribute == 'pointsScoredByTeam'
                || attribute == 'pointsScoredByOpposition' || attribute == 'pointsDifferential' 
                || attribute == 's.season' || attribute == 't.team_id' || attribute == 'p.player_id') {
                    // brojevi
            if(!isNaN(parseInt(text))) {
                jsonQuery += ` WHERE ${attribute} = ${text} `;
            } else {
                jsonQuery += ` WHERE FALSE `
            }
        } else {    // stringovi
            if(isNaN(parseInt(text))) {
                jsonQuery += ` WHERE LOWER(${attribute}) LIKE LOWER(\'%${text}%\') `;
            } else {
                jsonQuery += ` WHERE FALSE `
            } 
        }
    }
    jsonQuery += ` GROUP BY t.team_id, s.gamesWon, s.gamesLost, s.pointsScoredByTeam, s.pointsScoredByOpposition, s.pointsDifferential, s.coach, s.season
                    ) AS t
                ) TO \'C:\\Users\\Korisnik\\Desktop\\NOVO\\ORlabosNovo\\or-main\\or-main\\result.json\' `;
    
    try {
        console.log(jsonQuery);
       await pool.query(jsonQuery);
    } catch (error) {
        console.error('Error during JSON generation:', error);
    }
}

app.post('/submitForm', async (req, res) => {
    var baseQuery = `SELECT 
                        CAST(t.team_id AS VARCHAR(10)) AS team_id, 
                        teamName, 
                        city, 
                        conference, 
                        division, 
                        CAST(gamesWon AS VARCHAR(10)) AS gamesWon, 
                        CAST(gamesLost AS VARCHAR(10)) AS gamesLost, 
                        CAST(pointsScoredByTeam AS VARCHAR(10)) AS pointsScoredByTeam, 
                        CAST(pointsScoredByOpposition AS VARCHAR(10)) AS pointsScoredByOpposition, 
                        CAST(pointsDifferential AS VARCHAR(10)) AS pointsDifferential, 
                        coach, 
                        CAST(s.season AS VARCHAR(10)) AS season,
                        p.player_id, 
                        playerFirstName, 
                        playerLastName 
                    FROM NFLteamSeason as s 
                        INNER JOIN player_season AS ps 
                        ON (ps.team_id = s.teamID AND ps.season = s.season) 
                        INNER JOIN NFLplayer AS p 
                        ON ps.player_id = p.player_id 
                        INNER JOIN NFLteam AS t 
                        ON ps.team_id = t.team_id`;
    try {
        const attribute = req.body.attribute;
        const keyword = req.body.tekst;

        if(keyword !== '') {
            if(attribute == 'wildcard') {   // pretrazivanje svega
                if(!isNaN(parseInt(keyword))) {
                    baseQuery += `  WHERE t.team_id = ${keyword}
                                    OR p.player_id = ${keyword}
                                    OR gamesWon = ${keyword}
                                    OR gamesLost = ${keyword}
                                    OR pointsScoredByTeam = ${keyword}
                                    OR pointsScoredByOpposition = ${keyword}
                                    OR pointsDifferential = ${keyword}
                                    OR s.season = ${keyword}` 
                } else {
                    baseQuery += ` WHERE
                               LOWER(teamName) LIKE LOWER(\'%${keyword}%\')
                               OR LOWER(city) LIKE LOWER(\'%${keyword}%\')
                               OR LOWER(playerFirstName) LIKE LOWER(\'%${keyword}%\')
                               OR LOWER(playerLastName) LIKE LOWER(\'%${keyword}%\')
                               OR LOWER(conference) LIKE LOWER(\'%${keyword}%\')
                               OR LOWER(division) LIKE LOWER(\'%${keyword}%\')
                               OR LOWER(coach) LIKE LOWER(\'%${keyword}%\')`
                }
            } else if(attribute == 'gamesWon' || attribute == 'gamesLost' || attribute == 'pointsScoredByTeam'
                || attribute == 'pointsScoredByOpposition' || attribute == 'pointsDifferential' 
                || attribute == 's.season' || attribute == 't.team_id' || attribute == 'p.player_id') {
                    // slucaj kada se trazi neki broj - mora biti tocan broj
                    if(!isNaN(parseInt(keyword))) {
                        baseQuery += ` WHERE ${attribute} = ${keyword}`;
                    } else {
                        baseQuery += ` WHERE FALSE `
                    }
            } else {    // slucaj kada se trazi string - dovoljan je dio stringa
                if(isNaN(parseInt(keyword))) {
                    baseQuery += ` WHERE LOWER(${attribute}) LIKE LOWER(\'%${keyword}%\')`;
                } else {
                    baseQuery += ` WHERE FALSE `
                }
            }
            await setJsonResult(attribute, keyword);
            await setCsvResult(attribute, keyword);
            
            //console.log(baseQuery);
            const result = await pool.query(baseQuery);
            if(result === null) {
                console.log("Rezultat je null");
                res.json("[]");
            } else {
                res.json(result.rows);
            }
        } else {
            await setJsonResult(attribute, keyword);
            await setCsvResult(attribute, keyword);
            const result = await pool.query(baseQuery);
            if(result === null) {
                console.log("Rezultat je null");
                res.json("[]");
            } else {
                res.json(result.rows);
            }
        }
        
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
