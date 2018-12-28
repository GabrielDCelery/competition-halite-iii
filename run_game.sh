#!/bin/sh

./halite --replay-directory replays/ -vvv --width 64 --height 64 "node MyBot.js" "node ./bots/v8/MyBot.js"
