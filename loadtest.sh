#! /bin/bash

while sleep 1;
do 
  curl -s $1 cmd; 
  echo "";
done
