# Listing-Details-Sidebar

## Description

The goal of this project was to [inherit a microservice component from a collegue](https://github.com/Team-Elysium/listing-details) with a basic backend and scale it to production levels capable of handling thousands of requests per second. The scope of my work is exclusive to the backend including the:

- Server: HTTP
- Proxy: HTTP
- Database: MongoDB
- Remote-Cache: Redis
- Remote-Monitoring-Service: Prometheus/Grafana
- Load-Balancer: Nginx
- Deployment: Docker/AWS EC2 t2.micro

![service-flow-chart](documentation/images/Flow-Chart.png)

    Note: Because this has many remote services there will be no instructions on how to deploy each service. Instead this README is a study and explanation of the techniques used for optimization.

## Table of Contents

- [notes-on-load-testing](#notes-on-load-testing)
- [proxy](#proxy)
- [server](#server)
- [database](#database)
- [caching](#caching)
- [monitoring](#monitoring)
- [load-balancing](#load-balancing)
- [deployment](#deployment)

## Notes On Load Testing

There are a few considerations to make when load testing and optmizing.

**Test Early** and test often. Being able to view incremental gains as a project develops can be crucial into endgame optimizations.

**Choose a Consistent Strategy** so that the tests are repeatable. You need all things to be equal between to tests to accuratly measure and compare performances. Identifying what you need to test and how you will do it will make a big difference in the long run.

**Length of the Test** is an important consideration to make. Its possible that the time you choose ends just momemnts before your server reaches its limit. To choose an appropriate length you should test out multiple variations and see when it seems that your server has stabilized.

**Other Instance Processes** should be taking into account as well. The server managing a heavy load will use more and more resources. If another process is running on the computer it might reach its limit earlier than intended.

**Proper Analasis of Failures** is another critical consideration when stress testing. Once we begind to see hicups in performance it is important we are able to explain them. If we cannot then breakdowns further down the road will also be unexplainable.

**Everything Is Temporary**, meaning that tests today might not have the same results as the tests we perform tomorrow, one week, or even one month from now.

Sources:

- https://engineering.klarna.com/four-load-testing-mistakes-developers-love-to-make-68b443f7e8a2
- https://rraheja.wordpress.com/2011/02/08/5-performance-testing-considerations-for-application-integrations/
- https://stackify.com/ultimate-guide-performance-testing-and-software-testing/

## Service & Proxy

The Service and Proxy used for this project was also an inherited [repository](https://github.com/Team-Elysium/real-estate-listing-page) from collegues. The only optimizations made to the Proxy a refactor to barebones HTTP from Express. Subsequently an HTML page was required as the previous iteration was using a view engine coupled with ejs files.

The Service was also

## Server

While Express exposes and provides a lot of tooling built ontop of Node's HTTP, it [comes at a steep cost](https://raygun.com/blog/nodejs-vs-hapi-express-restify-koa/). Because our proxy and server are both implementing rather simple functionality, refactoring to use HTTP would be greatly benefitial.

## Database

Choosing a database for the project was done through a process of elimination.

_Data Structure_ plays a key role in choosing a database. The data strucutre will be what determines wether we will use a relational database or a document database (SQL vs noSQL).

_Scalability_ is something I needed to think about for the long-term. While the database is _usually_ not the bottleneck when beginning to scale, it will inevitably face problems. Having easy, built in solutions to these problems plays a huge role on the decision process.

_For This Project_ data structure and scalability led me to my decision. I inherited a datastructure that was already defined to fit the front end on this project. For this reason I did not have to think about the format of the datastructure but rather which database it would fit best in. Because it was a single object per datapoint a document database would suffice.

These days a lot of databases are starting to blur the lines between what kind of database they actually are (see [postgreSQL](https://www.postgresql.org/docs/9.5/functions-json.html) or [MongoDB](https://docs.mongodb.com/manual/tutorial/model-referenced-one-to-many-relationships-between-documents/)). With that being said, without getting too much into the weeds, I will assume that traditional relational databases do relational data better and document databases do documents better.

**MongoDB** was chosen for a few basic reasons. This project has extremely basic requirements in terms a querying. Each client only needs to be able to read documents. Outside of that the only other consideration needed is how easy it is to scale. MongoDB utilizes a simple query language through JavaScript and also provides [horizontal scaling opportunities](https://docs.mongodb.com/manual/sharding/) that should fullfill any future requirements.

## Caching

When considering caching there are two main strategies to consider, Lazy-Loading and Write Through. At the end of each consideration I explain my reasoning behind the choice i make.

Skip to:

- [Approaches](#approaches)
- [Timing](#timing)
- [Evictions](#evictions)

### APPROACHES

_Lazy-Loading_ is checking the cache and, on a miss, retrieving the data from the database, writing to the cache, and finally responding with the data. This method can be beneficial as we only store in the cache things that are actively being looked up. This can be a problem however with very random and relatively low demand data points being stored. Its also possible that we return incorrect data if something has been changed since it was last stored.

_Write Through_ is proactively updating the cache when we update the database so the cache is always up to date. This can keep our cache always returning the correct data but we again run into the problems of storing data points that might be low in demand and missing some high demand data points.

_For this project_: Simple Lazy Loading is utilized for this project. The application does not have any write-to-database features but, if it did, We would need to communicate with the other microservices to be updated with the information. Some really important details would be prices and contact information. If users did not believe our prices traffic would decrease. Additionally incorrect contact information would result in fewer listing turnovers which in turn would result in fewer turnovers. No one wants to use something that doesn’t do anything.

Overall a combination of the two is preferable. Lazy-Loading to keep high demand data in store as well as Write Through to keep it up to date. Another important consideration to make during configuration is time until expiration.

### TIMING

_Timing_ is a critical consideration when implementing caching. Not only will appropriate time to expiration affect our server response time it can also determine the loads our database experience at any given point.

Coming up with appropriate times is a subjective decision that one has to make. Considerations that would go into this is the traffic that the website experiences as well as volume of cached data we need to store.

Something to consider as well is how much data expires at the same time. If the server experiences and unusually low load for a period of time and ALL data expires during that time, when load is restored it could strain our database and result in performance issues. Because of this we need to have not only a set time but also a random amount of time added on. This would provide potential wiggle room in expiration times and hopefully help satisfy low load to high load occurrences.

_For this project_: Because this is a real estate listing website we would want high demand areas to be cached. Manhattan's West Village is a very popular place to rent an apartment but unfortunately this project uses random data so 100 random listings were chosen as the “top apartments”. As stated before the project only uses Lazy-Loading so anytime we miss a lookup we will cache an item. One thing to differentiate the top 100 is the amount of time until expirations. These will be stored for 5 minutes whereas everything else will be kept for 1 minute.

Additionally we will add a jitting of a random amount of time from 0 to the set expiration time. At most we will double the time in the cache and at least we will add nothing.

### EVICTIONS

_Evictions_ are another considerations. An eviction occurs when the cache has run out of space. It must decide on how to handle the data in the database and the data that is supposed to be stored. There are a few options to choose from for Redis:

- noeviction: return errors when the memory limit was reached and the client is trying to execute commands that could result in more memory to be used (most write commands, but DEL and a few more exceptions).
- allkeys-lru: evict keys by trying to remove the less recently used (LRU) keys first, in order to make space for the new data added.
- volatile-lru: evict keys by trying to remove the less recently used (LRU) keys first, but only among keys that have an expire set, in order to make space for the new data added.
- allkeys-random: evict keys randomly in order to make space for the new data added.
- volatile-random: evict keys randomly in order to make space for the new data added, but only evict keys with an expire set.
- volatile-ttl: evict keys with an expire set, and try to evict keys with a shorter time to live (TTL) first, in order to make space for the new data added.

  Note: https://redis.io/topics/lru-cache

_For this project_: allkeys-lru is chosen as we have already determined that laws of power will exists for this website. There will be popular pages that get accessed much more often than others as some listings will be more in more desirable locations and have better price ranges. Another note is that we have set the max memory setting to 1gb. Our redis cache is has a dedicated computer behind it so we can use a substantial amount of the computer's memory (in this case 100% of AWS EC2 t2 micro instance).

## Monitoring

_Monitoring_ is an important part of any system. Without monitoring we could only ever be reactionary to problems instead of detecting them early and acting _before_ it manifests into something larger.

[**Prometheus**](https://prometheus.io/) is an open source monitoring tool. With it, we can get regularly updated with our servers health and performance. Prometheus itself is a seperate server that will "reach out" and hit an endpoint that we define on the service's server. The service will then use the prom-client to serve up the data, formatted correctly, to Prometheus. It is important to note that there are alerting functionalitys offered through Prometheus that I did not implement.

[**prom-client**](https://github.com/siimon/prom-client) is used to interact with my Node server to collects data for me and ship it to Prometheus when we tell it to (when Prometheus hits the correct endpoint that we define). This module lets us monitor as much or as little as we want when we want to.

[**Grafana**](https://grafana.com/) is a 3rd party graphing tool that will take the Prometheus metrics and basically make them look pretty. It is a great visualization tool to use in combination with Prometheus and works with many other technologies as well.

_Metrics_ is the term used for the datapoints we are collecting from a process. With these open source tools we can collect as many as we want but there are a few that you wont want to miss:

- Success Rates: The amount of requests you respond to successfully over the total number of requests.
- Error Rates: How many times you return an error when responding to a request over the total requests.
- Invalid Rates: How many times an invalid request is sent to your server over the total number of requests.
- Latency: How long is it taking you to respond to requests.
- Database Time: How long its taking for your server to get the data from your database.

With these simple metrics we can determine a baseline for the health of our server.

_For This Project_, all of the above was implemented. Prometheus is a very powerful tool that, with little configuration, can help debug and open up bottlenecks specific to the server.

## Load-Balancing

_Load Balancing_ is the managment of requests across multiple instances of the same service. The idea behind load balancing is to horizontally optimize the total load our service can handle. If a single service can only effectively handle 1000 requests per second then it stands to reason 3 instances can handle 3 times as many. This was implemented to "open up" the bottleneck that was the single service.

_Nginx_ is a web server that can be used as many different tools. The webside touts many different benefits but I will use it as a reverse proxy. The main consideration for load balancing is how we determine which instance we choose to route the request to know as _scheduling_.

### Scheduling

_Round Robin_ is when the load balancer makes a list of available services. When it recieves a request it send it to the first in the list. For all subsequent requests it moves to the next service on the list. When it reaches the end of the list it resets to the beginning.

_Least Connections_ is a technique that monitors how many connections are open with a specific service. It then chooses the service with the least amount of outstanding connections.

_Least Time_ is when the load balancer keeps track of the average response time from each of the services. It then prioritizes the services that responds the quickest.

_For this project_: _Least Connections_ scheduling was chosen. This technique showed the most performant in many of my tests and also showed the least amount of load on any individual service at a given time.

## Deployment

There are a few services that will provide a remote machine to you for free today. I chose to go with [Amazon Web Services](https://aws.amazon.com/), specifically an AWS [EC2 t2.micro](https://aws.amazon.com/ec2/instance-types/t2/) instance. A basic AWS account is able to run these for free up to 750 hours a month.

Some important considerations when running these instances is:

- [Hour Accumulation](https://aws.amazon.com/ec2/pricing/): You get 750 hours for free across all servers. Multiple servers accrue concurrently meaning a single hour with two instances running will count as two hours used.
- [CPU Burst Performance](https://aws.amazon.com/ec2/instance-types/#burst): The t2.micro computers dont have a lot of CPU power. To make up for this Amazon offers CPU credits where, when needed, the server will overclock as time of high demand on the CPU. One minute running at this overclocked pace will use up a CPU token. Once all your CPU tokens are used up Amazon _might_ be [throttling your CPU capabilities](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/burstable-credits-baseline-concepts.html).
- Configuration: The default setting on these computers are not configured for high volume loads. Seeing as we are attempting to scale a service for large amount of traffic we need to play with the configuration so they dont get bogged down. The major culprits are the connection tables for the kernal. Much of this will become apparent by checking system logs during stress tests.

_For This Project_ everything deployed was placed onto an AWS EC2 t2.micro instance. The costs were minimal and they are easy to spin up and get running.
