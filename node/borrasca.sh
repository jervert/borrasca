#!/bin/sh
#/etc/init.d/borrasca

export PATH=$PATH:/usr/local/bin
export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules

case "$1" in
  start)
  exec forever --sourceDir=/path/to borrasca-next.app.js
  ;;
stop)
  exec forever stop --sourceDir=/path/to borrasca-next.app.js
  ;;
*)
  echo "Usage: /etc/init.d/borrasca {start|stop}"
  exit 1
  ;;
esac

exit 0