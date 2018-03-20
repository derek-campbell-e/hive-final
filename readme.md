# Hive - a better scheduler

## Install instructions
```
    npm install hive.io --save
```

## Hive Principles
The hive is a delicate ecosystem of bees performing delegated duties. Your one and only `Queen` bee is responsible for locating, spawning, and starting your `Drones`. `Drones` are bees that perform a task on a schedule. That schedule can be every 1 minute, or something more complex such as 'every 5 minutes after 10:30 am'. `Drones` are able to utilize and spawn `Workers` which carry out their own series of tasks to finish the job. The `Hive` knows all, and the `Queen` knows most things. 
### Use your `Mind`
The bees (`Drones`/`Workers`) use a modular reference called `Mind` that carries the smart stuff. When to run, what to run, that kind of stuff. We keep them sheltered from the rest of the process for compartmentalization and security. A `Drone:Mind` has no business accessing the `Queen's` or the `Hive's` methods, or even the methods of its `Drone`. Keep it simple, and keep them separated. 
*For ease of access, `Drone:Minds` and `Worker:Minds` module will be `let mind = {};`*

### Sample Usage
Let's say you need a complex task done every 5 minutes. Even better if you've already written a module to do it. You can make a `Drone` to do the work for you!
**file: <beeFolder>/drones/complexTaskDrone.js**
```js
    module.exports = function complexTaskDrone(){
        let mind = {}; // our mind property, feel free to add whatever properties you want, just keep the required ones
        mind.later = 'every 5 minutes'; // * required; the scheduler property. options are mind.hz = # in ms; or mind.cron = '* * * * *';
        mind.maxThreads = 5; // optional, set if you don't want more than # threads operating at once
        
        // * required this is the single task that your drone calls for each time to run based on schedule
        // when commanded via `run drone:complexTaskDrone`, callback contents will be outputted to console
        mind.task = function(callback){
            var externalModule = require('externalModule');
            externalModule.performTask(function(error, result){
                callback(error, result);
            });
        };
        return mind;
    };
```
Calling `run drone:complexTaskDrone` will fire your `Drone` immediately displaying in the console the arguments/result from the `callback`.
Otherwise, results will be logged in `./logs/results.txt`

## Hive
The hive's job is to keep track of things like your bees, your tasks, and also some analytics / metrics. It's got a CLI to handle your commands. It comes built with a socket.io instance so you can listen in on your hive's work. Or communicate with it from far away...

### CLI Usage
Enter your hive with the following command `hive [PORT=4202]`
This will start your hive if it isn't running already and enter the CLI. 
From here you have the following commands at your disposal. *
\* **prepending `hive` to these commands runs them without entering the CLI**

#### Hive Commands
`stats` or `ps` - show current stats like active bees, tasks, stdout/stderr, and metrics
`repl <host> <port> [options] [bees...]` - replicates current `beeFolder` from current hive to hive located at `<host>` and `<port>`

#### Drones & Workers
`retire <bees...>` - retires the specified bees. You can reference them either by beeID or with `<beeClass>:<mindName>`

#### Drone Commands
`load drones [-a, --all] [drones...]` - load drones into the `Queen` for running later. Drones do not start until you command them to.
`start drones [-a, --all] [-f, --fire-now] [drones...]` - start the drones specified or all. Optional argument to fire their task immediately.
`run drone:<name>` - run a drone from your `beeFolder` by `<name>`. Once task is complete, output is rendered to console. The `Drone` is retired if not already started. If already running on it's schedule then a new thread is immediately started not affecting the schedule.
`ls drones` - show the list of drones found / loaded / and running as told by the `Queen`.
`ps drones` - show stats activity for all drones as told by the `Queen`.
`ps drone:<mind>` or `ps <beeID>` - show detailed activity for the drone.

#### Worker Commands
`ls workers` - show the list of workers found / loaded / and running as told by the `Queen` and spawned by the `Drones`
`ps workers` - show stats activity for all workers as told by the `Queen`.
`ps worker:<mind>` or `ps <beeID>` - show detailed activity for the worker.

