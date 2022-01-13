<!--lint disable no-literal-urls-->
<p align="center">
  <a href="#">
    <img
      alt="EFT"
      src="https://isoflat.com/wp-content/uploads/2019/01/vector-isometric-soccer_1.jpg"
      width="400"
    />
  </a>
</p>

EFT CLI (Efficient Football Trading), meant to deal with datasets from various sources and make it works as a single consistent dataset, actiong as a decision-making software.

## Abstract

In 2021, I met a successful football trading(full-time trader) on Twitter. I was already trading by myself for a while and being inconstent, I was always wondering how this kind of person behave when he is trading. After couple of dms, I learned that he was delivering a training and I decided to step in. 
His course lasted about a week roughly. It was pretty dense, but very interesting. Listening and then reproducing each steps he showed us before to make any trade was the game changer, he gave me a point of view.
With hindsight, and a little practice I noticed pros and cons of his overall approach.
Pros:
    - a consistent approach, rely on numbers.
    - approaches the championships, the teams, and players as markets, stocks and assets.
    - analyse each encounters the same accuracy, with a set of concrete data leading to a well defined strategy, this document is a journal trading.
    - a clear set strategies, with requirements.
    - a risk management determined from strategies.
    - modular as long you keep the philosophy.

Cons:
    - very time consuming
    - incomplete
    
After the course, I decided to try the overall approach for one week and the results were good, **BUT** I must admit that the way he trades does not scale at all.

Being a software engineer with a slight interest on football and trading, I just found an interesting side-project to work on B).

## Table of contents

- [Prerequisites](#prerequisites)
- [Import](#import)
- [Fixture](#fixture)
- [Publish](#publish)
- [Opportunity](#opportunity)
- [Run](#run)
- [Status](#status)
- [Regulate](#regulate)
- [Version](#version)
- [Help](#help)


---
## Prerequisites

Get a license via https://www.api-football.com.

## Import

Import a dataset according a pre-determined country, could be invoked by typing: eft -i or eft --import. Built a consistent dataset for the country we fetched informations.
Pre-determined countries are:
 - Argentina (Superliga)
 - Belgium (Jupiler Pro League)
 - Brazil (Campeonato Brasileiro Série A)
 - England (Championship & Premier League)
 - France (Ligue 1)
 - Germany (Bundesliga)
 - Italy (Serie A)
 - Netherlands (Eredivisie)
 - Spain (LaLiga)
 - Turkey (Süper Lig)

```zsh
~/Labs/tradingoal (master ✘)✹ ᐅ eft -i
? Which country league do you want to import? (Use arrow keys)
❯ Argentina
  Belgium
  Brazil
  England
  France
  Germany
  Italy
(Move up and down to reveal more choices)
```

[back to top](#table-of-contents)


---


## Fixture

Fecth fixtures available to a given league, could be invoked by typing: eft -f or eft --fixture.

```zsh
~/Labs/tradingoal (master ✘)✹ ᐅ eft -f
? Please enter the season ? 2021
? Please enter the date of the fixture? 2021-06-24
? Which league do you want the fixtures? (Press <space> to select, <a> to toggle all, <i> to invert selection)
❯◯ Copa de la Liga Profesional de Futbol - Argentina
 ◯ Jupiler Pro League - Belgium
 ◯ Campeonato Brasileiro Serie A - Brazil
 ◯ Premier League - England
 ◯ Championship - England
 ◯ Ligue 1 - France
 ◯ Bundesliga - Germany
(Move up and down to reveal more choices)
```

[back to top](#table-of-contents)


---

## Publish

Publish journal trading for fixtures pre-fetched, could be invoked by typing: eft -p or eft --publish.

[back to top](#table-of-contents)


---

## Opportunity

Determine the best strategies according homeworks for fixtures available, could be invoked by typing: eft -o or eft --opportunity.

[back to top](#table-of-contents)


---

## Run

Do homeworks on fixtures pre-fecthed to build journal trading, could be invoked by typing: eft -r or eft --run.

[back to top](#table-of-contents)


---

## Status

Show the datasets status, could be invoked by typing: eft -s or eft --status.

```zsh
~/Labs/tradingoal (master ✘)✹ ᐅ eft -s
✔ Status:
[
  {
    "71": {
      "name": "Campeonato Brasileiro Série A",
      "country": "Brazil",
      "current": {
        "number_teams": 20,
        "number_players": 728
      },
      "expected": {
        "number_teams": 20,
        "number_players": 727
      }
    }
  },
  {
    "128": {
      "name": "Copa de la Liga Profesional de Fútbol",
      "country": "Argentina",
      "current": {
        "number_teams": 26,
        "number_players": 756
      },
      "expected": {
        "number_teams": 26,
        "number_players": 755
      }
    }
  },
  [
    {
      "NumberOfPlayersWithoutNumber": 70
    }
  ],
  [
    {
      "team_id": 1193,
      "name": "Cuiabá Esporte Clube (MT)"
    },
    {
      "details": "Team(s) having more than 8 players without any number affected, might cause problems when searching opportunities."
    }
  ]
]
```

[back to top](#table-of-contents)


---

## Regulate

Perform manually actions to fix dataset inconsistancy, could be invoked by typing: eft -reg or eft --regulate.

[back to top](#table-of-contents)

---


## Version

Show package version, could be invoked by typing: eft -s or eft --status.

[back to top](#table-of-contents)

---

## Help

Display help for command, could be invoked by typing: eft -h or eft --help.

[back to top](#table-of-contents)
