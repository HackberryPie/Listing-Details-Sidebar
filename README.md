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

#Routing

## EXPRESS VS HTTP

#Caching
When considering caching there are two main strategies to consider. Lazy-Loading and Write Through.

##APPROACHES
Lazy-Loading is checking the cache and, on a miss, retrieving the data from the database, writing to the cache, and finally responding with the data. This method can be beneficial as we only store in the cache things that are actively being looked up. This can be a problem however with very random and relatively low demand data points being stored. Its also possible that we return incorrect data if something has been changed since it was last stored.

Write Through is proactively updating the cache when we update the database so the cache is always up to date. This can keep our cache always returning the correct data but we again run into the problems of storing data points that might be low in demand and missing some high demand data points.

For this project: Simple Lazy Loading is utilized for this project. The application does not have any write-to-database features but, if it did, We would need to communicate with the other microservices to be updated with the information. Some really important details would be prices and contact information. If users did not believe our prices traffic would decrease. Additionally incorrect contact information would result in fewer listing turnovers which in turn would result in fewer turnovers. No one wants to use something that doesn’t do anything.

Overall a combination of the two is preferable. Lazy-Loading to keep high demand data in store as well as Write Through to keep it up to date. Another important consideration to make during configuration is time until expiration.

##TIMING
Timing is a critical consideration when implementing caching. Not only will appropriate time to expiration affect our server response time it can also determine the loads our database experience at any given point.

Coming up with appropriate times is a subjective decision that one has to make. Considerations that would go into this is the traffic that the website experiences as well as volume of cached data we need to store.

Something to consider as well is how much data expires at the same time. If the server experiences and unusually low load for a period of time and ALL data expires during that time, when load is restored it could strain our database and result in performance issues. Because of this we need to have not only a set time but also a random amount of time added on. This would provide potential wiggle room in expiration times and hopefully help satisfy low load to high load occurrences.

For this project: Because this is a real estate listing website we would want high demand areas to be cached. Manhattan's West Village is a very popular place to rent an apartment but unfortunately this project uses random data so 100 random listings were chosen as the “top apartments”. As stated before the project only uses Lazy-Loading so anytime we miss a lookup we will cache an item. One thing to differentiate the top 100 is the amount of time until expirations. These will be stored for 5 minutes whereas everything else will be kept for 1 minute.

For this project: Additionally we will add a jitting of a random amount of time from 0 to the set expiration time. At most we will double the time in the cache and at least we will add nothing.

##EVICTIONS
Evictions are another considerations. An eviction occurs when the cache has run out of space. It must decide on how to handle the data in the database and the data that is supposed to be stored. There are a few options to choose from for Redis:

noeviction: return errors when the memory limit was reached and the client is trying to execute commands that could result in more memory to be used (most write commands, but DEL and a few more exceptions).
allkeys-lru: evict keys by trying to remove the less recently used (LRU) keys first, in order to make space for the new data added.
volatile-lru: evict keys by trying to remove the less recently used (LRU) keys first, but only among keys that have an expire set, in order to make space for the new data added.
allkeys-random: evict keys randomly in order to make space for the new data added.
volatile-random: evict keys randomly in order to make space for the new data added, but only evict keys with an expire set.
volatile-ttl: evict keys with an expire set, and try to evict keys with a shorter time to live (TTL) first, in order to make space for the new data added.
Source: https://redis.io/topics/lru-cache
For this project: allkeys-lru is chosen as we have already determined that laws of power will exists for this website. There will be popular pages that get accessed much more often than others as some listings will be more in more desirable locations and have better price ranges. Another note is that we have set the max memory setting to 1gb. Our redis cache is has a dedicated computer behind it so we can use a substantial amount of the computer's memory (in this case 100% of AWS EC2 t2 micro instance).

#Monitoring
