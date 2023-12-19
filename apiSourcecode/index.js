const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
const port = 3001;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'NFLdatabase',
    password: 'lalelilolu',
    port: 5432,
});

const generateTeamLinks = (team) => {
    const teamId = team.team_id;
    return {
        self: `/api/teams/${teamId}`,
        players: `/api/teams/${teamId}/players`,
        seasons: `/api/teams/${teamId}/seasons`,
    };
};

app.get('/api/teams', async (req, res) => {     // GET za sve timove
    const client = await pool.connect();

    try {
        const result = await client.query('SELECT * FROM NFLteam');
        const teamsWithLinks = result.rows.map((team) => ({
            ...team,
            links: generateTeamLinks(team),
        }));
        res.json(teamsWithLinks);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
});

app.get('/api/teams/:id', async (req, res) => {     // GET za pojedinacni tim prema id
    const teamId = req.params.id;

    if(isNaN(teamId)) {
        res.status(400).send('Invalid id');
    } else {
        const client = await pool.connect();

        try {
            const result = await client.query('SELECT * FROM NFLteam WHERE team_id = $1', [teamId]);
            if (result.rows.length === 0) {
                res.status(404).json({ message: 'Team not found' });
            } else {
                const teamWithLinks = {
                    ...result.rows[0],
                    links: generateTeamLinks(result.rows[0]),
                };
                res.json(teamWithLinks);
            }
        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).send('Internal Server Error');
        } finally {
            client.release();
        }
    }
});

app.post('/api/teams', async (req, res) => {            // POST za stvaranje novog tima sa teamName, city, conference, division
    const { teamName, city, conference, division } = req.body;

    if (!teamName || !city || !conference || !division) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const client = await pool.connect();

    try {
        const result = await client.query(
            'INSERT INTO NFLteam(teamName, city, conference, division) VALUES($1, $2, $3, $4) RETURNING *',
            [teamName, city, conference, division]
        );
        const newTeam = result.rows[0];
        const newTeamWithLinks = {
            ...newTeam,
            links: generateTeamLinks(newTeam),
        };
        res.status(201).json(newTeamWithLinks);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
});

app.put('/api/teams/:id', async (req, res) => {     // PUT za mijenjanje podataka tima
    const teamId = req.params.id;
    if(isNaN(teamId) || !teamName || !city || !conference || !division) {
        res.status(400).send('Invalid input');
    } else {
        const { teamName, city, conference, division } = req.body;
        const client = await pool.connect();
        try {
            const existingTeam = await client.query('SELECT * FROM NFLteam WHERE team_id = $1', [teamId]);

            if (existingTeam.rows.length === 0) {
                res.status(404).json({ message: 'Team not found' });
                return;
            }

            const result = await client.query(
                'UPDATE NFLteam SET teamName = $2, city = $3, conference = $4, division = $5 WHERE team_id = $1 RETURNING *',
                [teamId, teamName, city, conference, division]
            );

            const updatedTeam = result.rows[0];
            const updatedTeamWithLinks = {
                ...updatedTeam,
                links: generateTeamLinks(updatedTeam),
            };

            res.json(updatedTeamWithLinks);
        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).send('Internal Server Error');
        } finally {
            client.release();
        }
    }
    
});

app.get('/api/teams/:id/seasons', async (req, res) => {     // GET stats od svih sezona
    const teamId = req.params.id;
    const client = await pool.connect();

    try {
        const result = await client.query('SELECT * FROM NFLteamSeason WHERE teamID = $1', [teamId]);
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

app.get('/api/teams/:id/players', async (req, res) => {     // GET za sve igrace nekog tima 
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

app.get('/api/teams/:id/players/:player_id/seasons/:season', async (req, res) => {      // GET za pojedinog igraca nekog tima odredene sezone
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

app.get('/api/players/:id', async (req, res) => {       // GET podaci igraca
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

app.get('/api/players', async (req, res) => {           // GET podataka svih igraca
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

app.delete('/api/teams/:id', async (req, res) => {      // DELETE za team
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

// ...


app.listen(port, () => {
    console.log(`API listening on port ${port}`);
});
