#!/bin/bash
source .env.development.local
truffle deploy --reset --network development --contracts_build_directory=./src/build/contracts