## core.io-registry

This is a sample project. To get started:
```
$ npm i core.io-registry
```

## OKKO 

OKKO pronounced (OK KO) is a service to register and monitor your applications. 

### Monitoring

### Registry

The registry provides Application information to different clients. The specific information is specific for each application instance. 



Application > MonitorService(Service) > TaskRunner(Task) > Probe(TaskService)

Monitor Service:

There are two ways we can create a service monitor for an application:

* through the web front-end
* applications that have a health attribute when they POST `/api/register`.

Usually an Application would have 0/1 services. In some cases we might want to monitor more than one end-point or monitor different transports (mqtt, http).


### Registration

Need to **POST** to the `/register` endpoint:

```json
{ 
    "server": {
        "port":9999
    },
    "hostname":"peperone.dev",
    "appId":"bot", 
    "environment":"development"
}
```

coreio applications can include the following in their app config file:

```
registration: {
    url: 'http://localhost:9350',
    data: {
        server: {
            port: 9999
        },
        hostname: 'goliatone.bot'
    },
}
```



### Development 

Fastest way to start is by using docker

#### MQTT

```
docker run --name vernemq \
  -p 1883:1883 \
  -p 8888:8888 \
  -p 9001:9001 \
  -e "DOCKER_VERNEMQ_ALLOW_ANONYMOUS=on" \
  -e "DOCKER_VERNEMQ_USER_ROOT=root" \
  -d erlio/docker-vernemq
```

Access container:

```
$ docker exec -ti e753d1c7ff1c /bin/bash 
```

Inside your container you have access to `vmq-admin`:

```
$ vmq-admin set allow_anonymous=on
```

#### Redis

```
docker run --name redis \
    -p 6379:6379 \
    -v /usr/local/var/db/redis:/data \
    -d redis
```

Access container:

```
$ docker exec -ti 22ff4468c241 redis-cli CONFIG SET notify-keyspace-events AKE
```

Redis setup:

```
CONFIG SET notify-keyspace-events AKE
```

#### MongoDB


```
docker run --name mongo \
    -p 27017:27017 \
    -v /usr/local/var/db/mongodb:/data/db \
    -d mongo
```

Or with auth:
```
docker run --name mongo \
    -p 27017:27017 \
    -v /usr/local/var/db/mongodb:/data/db \
    -e MONGO_INITDB_ROOT_USERNAME=mongoadmin \
	-e MONGO_INITDB_ROOT_PASSWORD=secret \
    -d mongo
```



## License
® License MIT by goliatone


```
ab -T 'application/x-www-form-urlencoded' -n 10000 -c 8 -p post.data http://localhost:7331/api/register
```

```python
import urllib
outfile = open('post.data', 'w')
params = ({ 'name': 'pepe', 'lastName': 'rone', age: 23 })
encoded = urllib.urlencode(params)
outfile.write(encoded)
outfile.close()
```

envset development -- npm start 


<!-- 
svelte UI elements:
https://github.com/scottbedard/svelte-heatmap
https://github.com/jikkai/svelte-flat
https://github.com/gCombinator/svelte-flat-ui
https://github.com/m59peacemaker/svelte-modal
https://github.com/saibotsivad/svelte-progress-bar
-->

<!-- 
https://sensuapp.org/
https://www.icinga.com/
https://alternativeto.net/tag/uptime-monitoring/

https://fonts.google.com/selection?category=Sans+Serif&selection.family=Audiowide|Bungee|Days+One|Exo|Fascinate+Inline|Monoton|Orbitron|Plaster|Russo+One

testing store:
https://glebbahmutov.com/blog/testing-svelte-store/
-->