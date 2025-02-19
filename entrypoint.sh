#!/bin/sh -l

curl -fsSL https://bun.sh/install | bash
echo "Hello $1"
time=$(date)
echo "time=$time" >> $GITHUB_OUTPUT