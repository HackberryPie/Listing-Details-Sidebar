# Listing-Details-Sidebar

## Description

This is listing details sidebar on Streetbreasy item page. The backend was built out and optimized to use MongoDB. The app is dockerized, optimized, and monitorized.

## Docker

Pull the images:

    Note: These links are for convenience. For setup, please see each sections details instructions.

    Service:
    Database:
    Proxy:
    Prometheus:

## Service -

    Setting up:
        Pull this Docker image:

## Database -

    Information:
        MongoDB was chosen as the database due to its ability to store in the correct shape we need to retrieve the information. This lessened the workload of the server at storage and retrieval time.

        The database was seeded with 10,000,000 datapoints using Faker to generate random and somewhat realistic data. Techniques used to seed the database included data pooling, batching, and multi-threading.

    Setting up:
        Pull this Docker image:

## Monitoring

    Setting up:
        Pull this Docker image:

## Installation Tips

reference: https://gist.github.com/ibraheem4/ce5ccd3e4d7a65589ce84f2a3b7c23a3

1. install brew
   - ensure brew is up to date
2. \$brew install postgresql
3. \$ln -sfv /usr/local/opt/postgresql/\*.plist ~/Library/LaunchAgents
4. $alias pg_start="launchctl load ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist"
   $alias pg_stop="launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist"
5. createuser -s postgres

## Commands

    - pg_start = start postgres
    - pg_stop  = stop postgres
    - createdb <insertDbName> = create db
    - psql <insertDbName> = get into created db
