#!/bin/bash
USERNAME=$1;

if grep authtoken ~/.ngrok2/ngrok.yml
then
    echo "Found your ngrok authtoken! Starting the HTTPS tunnel."
else
    echo "Did not find your ngrok authtoken. Log into your account at https://dashboard.ngrok.com/get-started (or have someone invite you), "
    echo "and run the 'ngrok authtoken' command to get it into your config file."
    echo "If you've already done this, are you sure your config file is at the default path of ~/.ngrok2/ngrok.yml ?"
    exit 1;
fi

if  [ -z "$USERNAME" ]
then
  ngrok http --host-header rewrite localhost:8080
else
  ngrok http --hostname="expensify-cash-$USERNAME.ngrok.io" --host-header rewrite localhost:8080
fi
