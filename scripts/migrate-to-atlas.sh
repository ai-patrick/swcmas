#!/usr/bin/env bash

# Dump local mongo container and restore to Atlas
ATLAS_URI="mongodb+srv://patombithi5_db_user:quJaIw4Ni5Y57rqW@cluster0.ayrmwkm.mongodb.net/swcmas?appName=Cluster0"
MONGO_CONTAINER="swcmas-mongo"
ARCHIVE="/tmp/swcmas_dump.gz"

docker exec "$MONGO_CONTAINER" bash -c "mongodump --archive=$ARCHIVE --gzip"
docker exec "$MONGO_CONTAINER" bash -c "mongorestore --uri='$ATLAS_URI' --gzip --archive=$ARCHIVE"

echo "✅ Migration to Atlas completed."
