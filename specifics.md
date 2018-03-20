# Queen
The Queen is your `Hive's` main mistress. Her prowess lies in delegating `Drones` and `Workers` and their data for eifficient use.

## Options
The queen gets initialized along with the hive, and the options passed to to the `Hive` are also passed to the `Queen`.
```js
    let Hive = require('hive.io')(options); -> hive.queen = require('../Queen')(hive, options);
```
### Default options
```js
    const defaultOptions = {};
    defaultOptions.beeFolder = path.join(__dirname, '..', '..', 'bees'); // default bee folder, currently located inside node_modules/hive.io/bees, but you should define this as something else
    defaultOptions.loadAllDrones = true; // load all the drones from the bees/drones folder
    defaultOptions.startDronesOnLoad = true; // start drones on their schedule as soon as they are loaded
    defaultOptions.loadDrones = []; // drones to load by default
    defaultOptions.startDrones = []; // drones to start by default
    defaultOptions.maxTaskRuntime = 60 * 1000; // max runtime for Drone tasks (not implemented)
```

## Routine
When the `Hive` is initialized, the `Queen` is spawn and her routine is as follows
1. Locate all the bees and generate metadata for them i.e. drone/worker name, drone/worker filepath, etc.
2. Based upon `options`, load the drones that are specified or load all drones found
3. Based upon `options`, start the drones that are specified or start them all. Starting a drone means it will run on its predefined schedule

## Other important information
Your queen is the bee that can spawn/start/retire other bees. This is the endpoint your `Hive` uses as well. It's important for the `Queen` to have lots to do.
*It's not recommended to programmatically spawn/start/retire bees through the queen, let the `Hive` handle that*

-----
# Drones
`Drones` are your schedulers. They'll run whenever you could possibly want. Let's say for instance every hour, or every second after 10 am until 11 am. They're flexible and can be used by themselves if that's what you so desire.

## Drone-Mind Requirements
Your `Drone` mind requires a few properties in order to run. Feel free to structure them as you wish, just as long as your `module.exports` returns the requirements.
```js
let mind = {};
mind.task = function(callback){}; // your task to be ran for your schedule, must use callback in order to complete task
// one of the following 3 scheduling properties:
mind.hz = 1000 * 60 * 5; // frequency in ms
mind.later = 'every 5 minutes' // later.parse.text formatted 
mind.cron = '5 * * * *' // cron formatted schedule (down to minutes)
```
### Optional
```js
mind.maxThreads = 5; // max threads/tasks a drone can run at once (think of a case where a task runs every second but taking 5 seconds to finish)
```

## Sample Drone
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

## Spawning Workers
Let's say you need to delegate some advanced processing to another bee. Let's also say this advanced processing is something you use routinely, and like the setup-once, use-forever model? Write yourself a `Worker` and use them in your drone task like so:
```js
mind.task = function(callback){
    let fileWriterWorker = this.worker('fileWriter' [,options]);
    fileWriterWorker("file.txt", "here's some data", callback);
};
```
`Workers` take an optional callback for when they are finished processing, so this example would write a file: `file.txt` with some data and when it's finished, the `Drone's` task is also finished!

## The `callback`
When running/firing a drone from the `CLI`, whatever is passed into the `callback` gets printed to the console. Regardless of `CLI` usage, results are logged in `/logs/results/drone:<mind>.txt`