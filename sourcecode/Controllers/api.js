const express = require('express');
const router = express.Router();
const data = require('../Models/dataManipulation');

router.get('/teams', async (req, res) => {
    try {
        const result = await data.queryThis('SELECT * FROM NFLteam');

        for (const team of result.rows) {
            const seasonsQuery = `SELECT * FROM NFLteamSeason WHERE teamID = ${team.team_id}`;
            const seasonsResult = await data.queryThis(seasonsQuery);
            team.seasons = seasonsResult.rows;
            team.seasons = seasonsResult.rows.map(season => ({
                "@context": {
                    "gamesWon": "Comment",
                    "gamesLost": "Comment",
                    "pointsScoredByTeam": "Comment",
                    "pointsScoredByOpposition": "Comment",
                    "pointsDifferential": "Comment"
                },
                '@type': "Season",
                'season': {
                    '@type': 'Number',
                    'value': season.season
                },
                'coach': {
                    '@type': 'Person',
                    'name': season.coach
                },
                'gamesWon': season.gameswon,
                'gamesLost': season.gameslost,
                'pointsScoredByTeam': season.pointsscoredbyteam,
                'pointsScoredByOpposition': season.pointsscoredbyopposition,
                'pointsDifferential': season.pointsdifferential,
            }));
        }

        const jsonString = JSON.stringify(result.rows, null, 2);

        const teams = JSON.parse(jsonString);
        const teamsJsonLd = teams.map(team => ({
            '@type': 'SportsTeam',
            'team_id': team.team_id,
            'city': {
                '@type': 'City',
                'name': team.city,
            },
            'conference': {
                '@type': 'SportsOrganization',
                'name': team.conference,
            },
            'division': {
                '@type': 'SportsOrganization',
                'name': team.division,
            },
            'seasons': team.seasons
        }));
        const finalJson = {};
        finalJson["@context"] = {
                        "@vocab": "https://schema.org/",
                        "city": "location",
                        "conference": "memberOf",
                        "division": "subOrganization",
                        "team_id": "vatID"
                };
        finalJson["NFLteams"] = teamsJsonLd;

        res.json(finalJson);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/teams/:id', async (req, res) => {     // GET za pojedinacni tim prema id
    const id = req.params.id;
    try {
        const result = await data.queryThis(`SELECT * FROM NFLteam WHERE NFLteam.team_id = ${id}`);

        for (const team of result.rows) {
            const seasonsQuery = `SELECT * FROM NFLteamSeason WHERE teamID = ${team.team_id}`;
            const seasonsResult = await data.queryThis(seasonsQuery);
            team.seasons = seasonsResult.rows;
            team.seasons = seasonsResult.rows.map(season => ({
                "@context": {
                    "gamesWon": "Comment",
                    "gamesLost": "Comment",
                    "pointsScoredByTeam": "Comment",
                    "pointsScoredByOpposition": "Comment",
                    "pointsDifferential": "Comment"
                },
                '@type': "Season",
                'season': season.season,
                'coach': {
                    '@type': 'Person',
                    'name': season.coach
                },
                'gamesWon': season.gameswon,
                'gamesLost': season.gameslost,
                'pointsScoredByTeam': season.pointsscoredbyteam,
                'pointsScoredByOpposition': season.pointsscoredbyopposition,
                'pointsDifferential': season.pointsdifferential,
            }));
        }

        const jsonString = JSON.stringify(result.rows, null, 2);

        const teams = JSON.parse(jsonString);
        const teamsJsonLd = teams.map(team => ({
            '@type': 'SportsTeam',
            'team_id': team.team_id,
            'city': {
                '@type': 'City',
                'name': team.city,
            },
            'conference': {
                '@type': 'SportsOrganization',
                'name': team.conference,
            },
            'division': {
                '@type': 'SportsOrganization',
                'name': team.division,
            },
            'seasons': team.seasons
        }));
        const finalJson = {};
        finalJson["@context"] = {
                        "@vocab": "https://schema.org/",
                        "city": "location",
                        "conference": "memberOf",
                        "division": "subOrganization",
                        "team_id": "vatID"
                };
        finalJson["NFLteams"] = teamsJsonLd;

        res.json(finalJson);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/teams', async (req, res) => {            // POST za stvaranje novog tima sa teamName, city, conference, division
    const { teamName, city, conference, division } = req.body;

    if (!teamName || !city || !conference || !division) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const result = await data.queryThis(
            `INSERT INTO NFLteam(teamName, city, conference, division) VALUES(${teamName}, ${city}, ${conference}, ${division}) RETURNING *`
        );
        const newTeam = result.rows[0];
        res.status(201).json(newTeam);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.put('/teams/:id', async (req, res) => {     // PUT za mijenjanje podataka tima
    const teamId = req.params.id;
    if(isNaN(teamId) || !teamName || !city || !conference || !division) {
        res.status(400).send('Invalid input');
    } else {
        const { teamName, city, conference, division } = req.body;
        try {
            const existingTeam = await client.query(`SELECT * FROM NFLteam WHERE team_id = ${teamId}`);

            if (existingTeam.rows.length === 0) {
                res.status(404).json({ message: 'Team not found' });
                return;
            }

            const result = await data.queryThis(
                `UPDATE NFLteam SET teamName = ${teamName}, city = ${city}, conference = ${conference}, division = ${division} WHERE team_id = ${teamId} RETURNING *`
            );

            const updatedTeam = result.rows[0];

            res.json(updatedTeam);
        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    
});

router.get('/teams/:id/seasons', async (req, res) => {     // GET stats od svih sezona
    const teamId = req.params.id;
    const client = await pool.connect();

    try {
        const result = await data.queryThis(`SELECT * FROM NFLteamSeason WHERE teamID = ${teamId}`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
});

const generatePlayerLinks = (teamId, playerId, season) => {
    return {
        self: `/api/teams/${teamId}/players/${playerId}/seasons/${season}`,    
        team: `/api/teams/${teamId}`,
        player: `/api/players/${playerId}`,
    };
};

const getTeamPlayers = async (teamId) => {
    const client = await pool.connect();
    
    try {
        const result = await client.query(
            'SELECT player_season.*, NFLplayer.playerfirstName, NFLplayer.playerlastName ' +
            'FROM player_season ' +
            'JOIN NFLplayer ON player_season.player_id = NFLplayer.player_id ' +
            'WHERE player_season.team_id = $1',
            [teamId]
        );
        return result.rows.map(player => ({
            ...player,
            links: generatePlayerLinks(teamId, player.player_id, player.season),
        }));
    } catch (error) {
        console.error('Error executing query:', error);
        throw new Error('Internal Server Error');
    } finally {
        client.release();
    }
};

const getPlayerSeasonTeam = async (player_id, team_id, season) => {
    const client = await pool.connect();

    try {
        const result = await client.query(
            'SELECT player_season.*, NFLplayer.playerfirstname, NFLplayer.playerlastname ' +
            'FROM player_season ' +
            'JOIN NFLplayer ON player_season.player_id = NFLplayer.player_id ' +
            'WHERE NFLplayer.player_id = $1 AND player_season.team_id = $2 AND player_season.season = $3',
            [player_id, team_id, season] 
        );
        return result.rows.map(player => ({
            ...player,
            links: generatePlayerLinks(team_id, player_id, season),
        }));
    } catch (error) {
        console.error('Error executing query:', error);
        throw new Error('Internal Server Error');
    } finally {
        client.release();
    }
};

router.get('/teams/:id/players', async (req, res) => {     // GET za sve igrace nekog tima 
    const teamId = req.params.id;
    if(isNaN(teamId)) {
        res.status(400).send('Invalid id');
    } else {
        try {
            const players = await getTeamPlayers(teamId);
            res.json(players);
        } catch (error) {
            console.error('Error retrieving players:', error);
            res.status(500).send('Internal Server Error');
        }
    }
});

router.get('/teams/:id/players/:player_id/seasons/:season', async (req, res) => {      // GET za pojedinog igraca nekog tima odredene sezone
    const teamId = req.params.id;
    const playerId = req.params.player_id;
    const season = req.params.season;

    if(isNaN(teamId) || isNaN(playerId) || isNaN(season)) {
        res.status(400).send('Bad request');
    } else {
        try {
            const players = await getPlayerSeasonTeam(playerId, teamId, season);
            res.json(players);
        } catch (error) {
            console.error('Error retrieving players:', error);
            res.status(500).send('Internal Server Error');
        }
    }
})

router.get('/players/:id', async (req, res) => {       // GET podaci igraca
    const playerId = req.params.id;
    if(isNaN(playerId)) {
        res.status(400).send('Bad request');
    } else {
        const client = await pool.connect();

        try {
            const result = await client.query('SELECT * FROM NFLplayer WHERE player_id = $1', [playerId]);
            if (result.rows.length === 0) {
                res.status(404).json({ message: 'Bad request' });
            } else {
                res.json(result.rows[0]);
            }
        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).send('Internal Server Error');
        } finally {
            client.release();
        }
    }
});

router.get('/players', async (req, res) => {           // GET podataka svih igraca
    const client = await pool.connect();

    try {
        const result = await client.query('SELECT * FROM NFLplayer');    
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
});

// ...

router.delete('/teams/:id', async (req, res) => {      // DELETE za team
    const teamId = req.params.id;

    const client = await pool.connect();

    try {
        const existingTeam = await client.query('SELECT * FROM NFLteam WHERE team_id = $1', [teamId]);

        if (existingTeam.rows.length === 0) {
            res.status(404).json({ message: 'Team not found' });
            return;
        }

        await client.query('DELETE FROM NFLteam WHERE team_id = $1', [teamId]);

        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
});

module.exports = router;