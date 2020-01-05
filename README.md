# Halite 3 Competition

## What is this project for?

This is my bot for the Halite 3 competition. It is a resource management game in which players build and command ships that explore the ocean and collect halite. Ships use halite as an energy source, and the player with the most stored halite at the end of the game is the winner.

## Rules

Visit: `https://2018.halite.io/learn-programming-challenge/game-overview`

## Final place

`222` out of `4014 competitors`.

# Highlights of the game strategy

## Heat map

At the beginning of the game the map is split into areas and every turn after updating the game state a `recommendation level` gets assigned to each area to determine the `areas of interest` by using the following factors:

- allied ships in the area
- allied dropoffs in the area
- enemy ships in the area
- enemy dropoffs in the area
- halite in the area

## Director AI and Micro AI

I ended up developing two types of AI for the game. There is a `Micro AI for the ships`, which is basically a `finite state machine`, and there is a `Director AI for managing the global strategy`. Every time a turtle does not having else to do it asks the Director AI which area of the map to go next.

## Micro AI

This is a finite state machine for the ships with the following states:

- move to area
- collect halite in area
- move to dropoff
- move to location and convert to dropoff
- suicide rush home

Every turn the ships evaluate whether they have to stay in their current state or if it is better to move to an other state and then find an execute the best possible action within that state. `For certain state transitions the ships consult with the Director AI and also can talk to each other to make sure no collision happens`.

## Director AI

The Director AI is responsible for determining:

- How many ships to build
- Which areas to send ships for collecting halite
- Assigning locations for dropoffs for more efficient halite delivery

# Summary

Overall I was very satisfied with the end result. The AI worked very well on larger maps, but had difficulties on the smaller ones, especially if there were 4 players.

## Parts of the code that I am proud of

- The code that updates the `areas of interest` and manages the generation of `dropoff points`
- The system that allows the ships to communicate with each other to avoid collision

## Parts of the code that I am dissatisfied with

- The AI had trouble managing smaller maps especially with 4 players
- Did not have time to extend the AI with the ability to fight and intentionally sink enemy ships
- Did not have time to develop an algorithm that fine tunes the constants that are used
