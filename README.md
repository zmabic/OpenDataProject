# Open Data Project

Prikaz otvorenih podataka o NFL timovima i REST API za upravljanje tim podacima - napravljeno u sklopu predmeta **Otvoreno računarstvo** Fakulteta elektrotehnike i računarstva.

## Opis
Baza sadrži podatke o NFL timovima, njihovim igračima i podacima za svaku sezonu. Prikaz tih podataka ostvaren je u obliku tablice na */datatable* gdje se ti podaci mogu pretraživati ključnim riječima prema stupcima tablice pojedinačno ili prema svim stupcima zajedno koristeći opciju *wildcard*. 
Filtriranje se radi na strani backenda, a korisnik ima i mogućnost preuzimanja filtriranih podataka u *csv* ili *json* obliku. 
REST API je napravljen za dohvat svih ili dijela, dodavanje, mijenjanje i brisanje podataka; te je napravljen prema specifikaciji OpenAPI.
Za sigurnsot je u aplikaciju integrirana Single sign-on usluga *Auth0*, te je pristup podacima i API-ju omogućen samo sa kombinacijom:  *email* = or@or.hr + *lozinka* = Password1!
