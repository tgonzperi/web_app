#!/bin/bash
npm run build

sudo node index.js &> send.txt

sendmail tgonzperi@gmail.com < send.txt
