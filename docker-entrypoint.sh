#!/bin/sh
set -e

#
rm -rf /root/.ssh
mkdir /root/.ssh
chmod 600 /root/.ssh
cp /secrets/id_rsa /root/.ssh/id_rsa
chmod 600 /root/.ssh/id_rsa



exec  node /app/app.js