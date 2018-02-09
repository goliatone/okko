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
https://sensuapp.org/
https://www.icinga.com/
https://alternativeto.net/tag/uptime-monitoring/
-->