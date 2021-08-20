#!/bin/bash
for FILE in ./contracts/*.sol; do
    npx hardhat flatten $FILE > "${FILE%.*}.txt"
done