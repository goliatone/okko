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