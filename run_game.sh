#!/bin/sh

./halite --replay-directory replays/ -vvv --width 32 --height 32 "node MyBot.js" "node ./bots/v12/MyBot.js"
