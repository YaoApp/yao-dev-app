#!/bin/bash
# Echo script for testing sandbox skill integration

MESSAGE="${1:-Hello from echo-test skill}"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

echo "ECHO [$TIMESTAMP]: $MESSAGE"
