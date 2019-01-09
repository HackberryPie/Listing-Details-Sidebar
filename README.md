# listing-details

Listing details sidebar on Streeteasy item page

# Installation Tips

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
