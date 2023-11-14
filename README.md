Licencija: CC0 (Besplatno korištenje za bilo koga u bilo koju svrhu bez ikakvih ograničenja ili zahtjeva)

Autor: Zvonimir Mabić

Verzija podataka: 2.0

Jezik podataka: engleski

Kratki opis podataka

Table NFLteam oznacava opcenite podatke o pojeninom timu: ime, grad, konferencija itd., tu kao primarni ključ imamo id. Imamo i table NFL NFLteamSeason koji označava rezultate pojedinog tima u određenoj sezoni. Njega identificiraju sezona i teamID. Tu za svaki tim u sezoni su zapisani broj dobivenih i izgubljenih utakmica, broj bodova protiv drugih timova i protiv njih, razlika izmedu tih brojeva, trener te sezone, sami broj sezone. Table NFLplayer oznacava igraca koji je identificiran sa atributom id. Svaki igrac ima ime i prezime. Sve to povezuje table player_season koji spaja pojedinog igraca sa njegovim klubom u odredenoj sezoni. 

Opis atributa:
- id - primarni ključ svakog retka
- name - ime NFL kluba
- city 
- conference
- division - unutar svake konferencije postoje 4
- gamesWon - broj dobivenih partija te sezone
- gamesLost
- pointsScoredByTeam
- pointsScoredByOpposition
- pointsDifferential
- coach - trener te sezone
- season
- players - svaki ima ime i prezime, svaki klub ima vise igraca
