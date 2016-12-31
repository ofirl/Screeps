// room server object extend

var mod = {
    extend: function () {
        // TODO : copy and comment on the code from OBS

        // room.container property
        let Container = function(room){
            this.room = room;

            Object.defineProperties(this, {
                // room.container.all = all containers
                'all': {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this.room.memory.container)) {
                            this.room.saveContainers();
                        }
                        if( _.isUndefined(this._container) ){
                            this._container = [];
                            let add = entry => {
                                let cont = Game.getObjectById(entry.id);
                                if( cont ) {
                                    _.assign(cont, entry);
                                    this._container.push(cont);
                                }
                            };
                            _.forEach(this.room.memory.container, add);
                        }
                        return this._container;
                    }
                },
                // room.container.controller = controller container
                'controller': {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this._controller) ){
                            if( this.room.my && this.room.controller.memory.storage ){
                                this._controller = [Game.getObjectById(this.room.controller.memory.storage)];
                                if( !this._controller[0] ) delete this.room.controller.memory.storage;
                            } else {
                                let byType = c => c.controller == true;
                                this._controller = _.filter(this.all, byType);
                            }
                        }
                        return this._controller;
                    }
                },
                // room.container.managed = container with source and controller nearby
                'managed': {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this._managed) ){
                            let byType = c => c.source === true && c.controller == true;
                            this._managed = _.filter(this.all, byType);
                        }
                        return this._managed;
                    }
                },
                // room.container.in = containers that have source or mineral nearby and not a controller
                'in': {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this._in) ){
                            let byType = c => (c.source === true || c.mineral === true ) && c.controller == false;
                            this._in = _.filter(this.all, byType);
                            // add managed
                            let isFull = c => c.sum >= (c.storeCapacity * (1-MANAGED_CONTAINER_TRIGGER));
                            this._in = this._in.concat(this.managed.filter(isFull));
                        }
                        return this._in;
                    }
                },
                // room.container.out = containers that do not have source or mineral nearby
                'out': {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this._out) ){
                            let byType = c => (c.source === false && !c.mineral);
                            this._out = _.filter(this.all, byType);
                            // add managed
                            let isEmpty = c => c.sum <= (c.storeCapacity * MANAGED_CONTAINER_TRIGGER);
                            this._out = this._out.concat(this.managed.filter(isEmpty));
                        }
                        return this._out;
                    }
                }
            });
        };

        // room.links property
        let Links = function(room){
            this.room = room;

            Object.defineProperties(this, {
                // room.links.all = all links
                'all': {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this.room.memory.links)) {
                            this.room.saveLinks();
                        }
                        if( _.isUndefined(this._all) ){
                            this._all = [];
                            let add = entry => {
                                let o = Game.getObjectById(entry.id);
                                if( o ) {
                                    _.assign(o, entry);
                                    this._all.push(o);
                                }
                            };
                            _.forEach(this.room.memory.links, add);
                        }
                        return this._all;
                    }
                },
                // room.link.container = link with a nearby controller
                'controller': {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this._controller) ){
                            let byType = c => c.controller === true;
                            this._controller = this.all.filter(byType);
                        }
                        return this._controller;
                    }
                },
                // room.link.storage = link with a storage nearby
                'storage': {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this._storage) ) {
                            let byType = l => l.storage == true;
                            this._storage = this.all.filter(byType);
                        }
                        return this._storage;
                    }
                },
                // room.link.in = link with no storage or controller nearby
                'in': {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this._in) ) {
                            let byType = l => l.storage == false && l.controller == false;
                            this._in = _.filter(this.all, byType);
                        }
                        return this._in;
                    }
                },
                // room.link.privateers = link with no storage or controller nearby and with energy level below 85%
                'privateers': {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this._privateers) ) {
                            let byType = l => l.storage == false && l.controller == false && l.source == false && l.energy < l.energyCapacity * 0.85;
                            this._privateers = _.filter(this.all, byType);
                        }
                        return this._privateers;
                    }
                }
            });
        };

        // room.structures property
        let Structures = function(room){
            this.room = room;

            Object.defineProperties(this, {
                // room.structures.all = all structures
                'all': {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this._all) ){
                            this._all = this.room.find(FIND_STRUCTURES);
                        }
                        return this._all;
                    }
                },
                // room.structures.spawns = all spawns structures
                'spawns': {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this.room.memory.spawns) ) {
                            this.room.saveSpawns();
                        }
                        if( _.isUndefined(this._spawns) ){
                            this._spawns = [];
                            var addSpawn = id => { addById(this._spawns, id); };
                            _.forEach(this.room.memory.spawns, addSpawn);
                        }
                        return this._spawns;
                    }
                },
                // room.structures.towers = all towers structures
                'towers': {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this.room.memory.towers)) {
                            this.room.saveTowers();
                        }
                        if( _.isUndefined(this._towers) ){
                            this._towers = [];
                            var add = id => { addById(this._towers, id); };
                            _.forEach(this.room.memory.towers, add);
                        }
                        return this._towers;
                    }
                },
                // room.structures.repairable = repairable structures
                // TODO : add FlagDir or change it (+14 lines)
                'repairable': {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this._repairable) ){
                            let that = this;
                            this._repairable = _.sortBy(
                                that.all.filter(
                                    structure => (
                                        structure.hits < structure.hitsMax &&
                                        ( !that.room.my || structure.hits < MAX_REPAIR_LIMIT[that.room.controller.level] || structure.hits < (LIMIT_URGENT_REPAIRING + (3*(DECAY_AMOUNT[structure.structureType] || 0)))) &&
                                        ( !DECAYABLES.includes(structure.structureType) || (structure.hitsMax - structure.hits) > GAP_REPAIR_DECAYABLE ) &&
                                        ( structure.towers === undefined || structure.towers.length == 0) &&
                                        ( Memory.pavementArt[that.room.name] === undefined || Memory.pavementArt[that.room.name].indexOf('x'+structure.pos.x+'y'+structure.pos.y+'x') < 0 ) &&
                                        ( !FlagDir.list.some(f => f.roomName == structure.pos.roomName && f.color == COLOR_ORANGE && f.x == structure.pos.x && f.y == structure.pos.y) )
                                    )
                                ),
                                'hits'
                            );
                        }
                        return this._repairable;
                    }
                },
                // room.structures.urgentRepairable = urgent repairable structures
                'urgentRepairable': {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this._urgentRepairableSites) ){
                            var isUrgent = site => (site.hits < (LIMIT_URGENT_REPAIRING + (3*(DECAY_AMOUNT[site.structureType] || 0))));
                            this._urgentRepairableSites = _.filter(this.repairable, isUrgent);
                        }
                        return this._urgentRepairableSites;
                    }
                },
                // room.structures.fortifyable = fortifyable structures
                'fortifyable': {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this._fortifyableSites) ){
                            let that = this;
                            this._fortifyableSites = _.sortBy(
                                that.all.filter(
                                    structure => (
                                        that.room.my &&
                                        structure.hits < structure.hitsMax &&
                                        structure.hits < MAX_FORTIFY_LIMIT[that.room.controller.level] &&
                                        ( structure.structureType != STRUCTURE_CONTAINER || structure.hits < MAX_FORTIFY_CONTAINER ) &&
                                        ( !DECAYABLES.includes(structure.structureType) || (structure.hitsMax - structure.hits) > GAP_REPAIR_DECAYABLE*3 ) &&
                                        ( Memory.pavementArt[that.room.name] === undefined || Memory.pavementArt[that.room.name].indexOf('x'+structure.pos.x+'y'+structure.pos.y+'x') < 0 ) &&
                                        ( !FlagDir.list.some(f => f.roomName == structure.pos.roomName && f.color == COLOR_ORANGE && f.x == structure.pos.x && f.y == structure.pos.y) )
                                    )
                                ),
                                'hits'
                            );
                        }
                        return this._fortifyableSites;
                    }
                },
                // room.structures.fuelable = fuelable structures
                'fuelable': {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this._fuelables) ){
                            var that = this;
                            var factor = that.room.situation.invasion ? 1 : 0.82;
                            var fuelable = target => (target.energy < (target.energyCapacity * factor));
                            this._fuelables = _.sortBy( _.filter(this.towers, fuelable), 'energy') ; // TODO: Add Nuker
                        }
                        return this._fuelables;
                    }
                },
                // room.structures.container property
                'container' : {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this._container) ){
                            this._container = new Container(this.room);
                        }
                        return this._container;
                    }
                },
                // room.structures.links property
                'links' : {
                    configurable: true,
                    get: function() {
                        if( _.isUndefined(this._links) ){
                            this._links = new Links(this.room);
                        }
                        return this._links;
                    }
                }
            });
        };

        Object.defineProperties(Room.prototype, {
            // room.structures property
            'structures': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this._structures) ){
                        this._structures = new Structures(this);
                    }
                    return this._structures;
                }
            },
            // room.sources property
            'sources': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this.memory.sources) || this.name == 'sim') {
                        this._sources = this.find(FIND_SOURCES);
                        if( this._sources.length > 0 ){
                            this.memory.sources = this._sources.map(s => s.id);
                        } else this.memory.sources = [];
                    }
                    if( _.isUndefined(this._sources) ){
                        this._sources = [];
                        var addSource = id => { addById(this._sources, id); };
                        this.memory.sources.forEach(addSource);
                    }
                    return this._sources;
                }
            },
            // room.droppedResources property
            'droppedResources': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this._droppedResources) ){
                        this._droppedResources = this.find(FIND_DROPPED_RESOURCES);
                    }
                    return this._droppedResources;
                }
            },
            // room.sourcesAccessibleFields property
            'sourceAccessibleFields': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this.memory.sourceAccessibleFields)) {
                        let sourceAccessibleFields = 0;
                        let sources = this.sources;
                        var countAccess = source => sourceAccessibleFields += source.accessibleFields;
                        _.forEach(sources, countAccess);
                        this.memory.sourceAccessibleFields = sourceAccessibleFields;
                    }
                    return this.memory.sourceAccessibleFields;
                }
            },
            // room.sourcesEnergyAvailable property
            'sourceEnergyAvailable': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this._sourceEnergyAvailable) ){
                        this._sourceEnergyAvailable = 0;
                        var countEnergy = source => (this._sourceEnergyAvailable += source.energy);
                        _.forEach(this.sources, countEnergy);
                    }
                    return this._sourceEnergyAvailable;
                }
            },
            // room.ticksToNextRegeneration property
            'ticksToNextRegeneration': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this._ticksToNextRegeneration) ){
                        this._ticksToNextRegeneration = _(this.sources).map('ticksToRegeneration').min() || 0;
                    }
                    return this._ticksToNextRegeneration;
                }
            },
            // room.relativeEnergyAvailable property
            'relativeEnergyAvailable': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this._relativeEnergyAvailable) ){
                        this._relativeEnergyAvailable = this.energyCapacityAvailable > 0 ? this.energyAvailable / this.energyCapacityAvailable : 0;
                    }
                    return this._relativeEnergyAvailable;
                }
            },
            // room.reservedSpawnEnergy property
            'reservedSpawnEnergy': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this._reservedSpawnEnergy) ) {
                        this._reservedSpawnEnergy = 0;
                    }
                    return this._reservedSpawnEnergy;
                },
                set: function(value) {
                    this._reservedSpawnEnergy = value;;
                }
            },
            // room.remainingEnergyAvailable property
            'remainingEnergyAvailable': {
                configurable: true,
                get: function() {
                    return this.energyAvailable - this.reservedSpawnEnergy;
                }
            },
            // room.relativeRemainingEnergyAvailable property
            'relativeRemainingEnergyAvailable': {
                configurable: true,
                get: function() {
                    return this.energyCapacityAvailable > 0 ? this.remainingEnergyAvailable / this.energyCapacityAvailable : 0;
                }
            },
            // room.towerFreeCapacity property
            'towerFreeCapacity': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this._towerFreeCapacity) ) {
                        this._towerFreeCapacity = 0;
                        var addFreeCapacity = tower => this._towerFreeCapacity += (tower.energyCapacity - tower.energy);
                        _.forEach(this.structures.towers, addFreeCapacity);
                    }
                    return this._towerFreeCapacity;
                }
            },
            // room.constructionSites property
            'constructionSites': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this._constructionSites) ) {
                        this._constructionSites = this.find(FIND_MY_CONSTRUCTION_SITES);
                    }
                    return this._constructionSites;
                }
            },
            // room.creeps property = my creeps
            'creeps': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this._creeps) ){
                        this._creeps = this.find(FIND_MY_CREEPS);
                    }
                    return this._creeps;
                }
            },
            // room.allCreeps property = all creeps
            'allCreeps': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this._allCreeps) ){
                        this._allCreeps = this.find(FIND_CREEPS);
                    }
                    return this._allCreeps;
                }
            },
            // room.hostiles property = hostile creeps
            'hostiles': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this._hostiles) ){
                        let notWhitelisted = (creep) =>
                            !(PLAYER_WHITELIST.some((player) =>
                                player.toLowerCase() == creep.owner.username.toLowerCase()
                            ));
                        this._hostiles = this.find(FIND_HOSTILE_CREEPS, { filter : notWhitelisted });
                    }
                    return this._hostiles;
                }
            },
            // room.hostileIds property
            'hostileIds': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this._hostileIds) ){
                        this._hostileIds = _.map(this.hostiles, 'id');
                    }
                    return this._hostileIds;
                }
            },
            // room.combatCreeps = my combat creeps, searches by name
            'combatCreeps': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this._combatCreeps) ){
                        this._combatCreeps = this.creeps.filter( c => ['melee','ranger','healer', 'warrior'].includes(c.data.creepType) );
                    }
                    return this._combatCreeps;
                }
            },
            // room.casualties property = my injured creeps
            'casualties': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this._casualties) ){
                        var isInjured = creep => creep.hits < creep.hitsMax &&
                        (creep.towers === undefined || creep.towers.length == 0);
                        this._casualties = _.sortBy(_.filter(this.creeps, isInjured), 'hits');
                    }
                    return this._casualties;
                }
            },

            // TODO : add defcon levels based on hostiles threat level (got property 'hostilesThreatLevel')
            // room.situation property = {noEnergy, invasion}
            'situation': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this._situation) ){
                        this._situation = {
                            noEnergy: this.sourceEnergyAvailable == 0,
                            invasion: this.hostiles.length > 0 && (!this.controller || !this.controller.safeMode)
                        }
                    }
                    return this._situation;
                }
            },
            // room.roadConstructionTrace property
            'roadConstructionTrace': {
                configurable: true,
                get: function () {
                    if (_.isUndefined(this.memory.roadConstructionTrace) ) {
                        this.memory.roadConstructionTrace = {};
                    }
                    return this.memory.roadConstructionTrace;
                }
            },
            // room.adjacentRooms property
            'adjacentRooms': {
                configurable: true,
                get: function () {
                    if (_.isUndefined(this.memory.adjacentRooms) ) {
                        this.memory.adjacentRooms = Room.adjacentRooms(this.name);
                    }
                    return this.memory.adjacentRooms;
                }
            },
            // room.adjacentAccessibleRooms property
            'adjacentAccessibleRooms': {
                configurable: true,
                get: function () {
                    if (_.isUndefined(this.memory.adjacentAccessibleRooms) ) {
                        this.memory.adjacentAccessibleRooms = Room.adjacentAccessibleRooms(this.name);
                    }
                    return this.memory.adjacentAccessibleRooms;
                }
            },
            // room.privateerMaxWeight property
            // TODO : understand the logic
            'privateerMaxWeight': {
                configurable: true,
                get: function () {
                    if (_.isUndefined(this._privateerMaxWeight) ) {
                        this._privateerMaxWeight = 0;
                        if ( !this.situation.invasion && !this.conserveForDefense ) {
                            let base = this.controller.level * 1000;
                            let that = this;
                            let adjacent, ownNeighbor, room, mult;

                            let flagEntries = FlagDir.filter([FLAG_COLOR.invade.robbing, FLAG_COLOR.invade.exploit]);
                            let countOwn = roomName => {
                                if( roomName == that.name ) return;
                                if( Room.isMine(roomName) ) ownNeighbor++;
                            };
                            let calcWeight = flagEntry => {
                                if( !this.adjacentAccessibleRooms.includes(flagEntry.roomName) ) return;
                                room = Game.rooms[flagEntry.roomName];
                                if( room ) {
                                    adjacent = room.adjacentAccessibleRooms;
                                    mult = room.sources.length;
                                } else {
                                    adjacent = Room.adjacentAccessibleRooms(flagEntry.roomName);
                                    mult = 1;
                                }
                                ownNeighbor = 1;
                                adjacent.forEach(countOwn);
                                that._privateerMaxWeight += (mult * base / ownNeighbor);
                            };
                            flagEntries.forEach(calcWeight);
                        }
                    };
                    return this._privateerMaxWeight;
                }
            },
            // room.claimerMaxWeight property
            // TODO : understand the logic
            'claimerMaxWeight': {
                configurable: true,
                get: function () {
                    if (_.isUndefined(this._claimerMaxWeight) ) {
                        this._claimerMaxWeight = 0;
                        let base = 1250;
                        let maxRange = 2;
                        let that = this;
                        let distance, reserved, flag;
                        let rcl = this.controller.level;

                        let flagEntries = FlagDir.filter([FLAG_COLOR.claim, FLAG_COLOR.claim.reserve, FLAG_COLOR.invade.exploit]);
                        let calcWeight = flagEntry => {
                            // don't spawn claimer for reservation at RCL < 4 (claimer not big enough)
                            if( rcl > 3 || (flagEntry.color == FLAG_COLOR.claim.color && flagEntry.secondaryColor == FLAG_COLOR.claim.secondaryColor )) {
                                distance = Room.roomDistance(that.name, flagEntry.roomName);
                                if( distance > maxRange )
                                    return;
                                flag = Game.flags[flagEntry.name];
                                if( flag.room && flag.room.controller && flag.room.controller.reservation && flag.room.controller.reservation.ticksToEnd > 2500)
                                    return;

                                reserved = flag.targetOf && flag.targetOf ? _.sum( flag.targetOf.map( t => t.creepType == 'claimer' ? t.weight : 0 )) : 0;
                                that._claimerMaxWeight += (base - reserved);
                            };
                        };
                        flagEntries.forEach(calcWeight);
                    };
                    return this._claimerMaxWeight;
                }
            },
            // room.conserveForDefense property
            'conserveForDefense': {
                configurable: true,
                get: function () {
                    return (this.my && this.storage && this.storage.store.energy < MIN_STORAGE_ENERGY[this.controller.level]);
                }
            },
            // room.hostilesThreatLevel property
            // TODO: add towers when in foreign room
            'hostileThreatLevel': {
                configurable: true,
                get: function () {
                    if (_.isUndefined(this._hostileThreatLevel) ) {
                        this._hostileThreatLevel = 0;
                        let evaluateBody = creep => {
                            this._hostileThreatLevel += Creep.bodyThreat(creep.body);
                        };
                        this.hostiles.forEach(evaluateBody);
                    }
                    return this._hostileThreatLevel;
                }
            },
            // room.defenseLevel property
            'defenseLevel': {
                configurable: true,
                get: function () {
                    if (_.isUndefined(this._defenseLevel) ) {
                        this._defenseLevel = {
                            towers: 0,
                            creeps: 0,
                            sum: 0
                        }
                        let evaluate = creep => {
                            this._defenseLevel.creeps += Creep.bodyThreat(creep.body);
                        };
                        this.combatCreeps.forEach(evaluate);
                        this._defenseLevel.towers = this.structures.towers.length;
                        this._defenseLevel.sum = this._defenseLevel.creeps + (this._defenseLevel.towers * Creep.partThreat.tower);
                    }
                    return this._defenseLevel;
                }
            },
            // room.minerals property (mineral ID)
            'minerals': {
                configurable:true,
                get: function () {
                    if( _.isUndefined(this.memory.minerals)) {
                        this.saveMinerals();
                    }
                    if( _.isUndefined(this._minerals) ){
                        this._minerals = [];
                        let add = id => { addById(this._minerals, id); };
                        this.memory.minerals.forEach(add);
                    }
                    return this._minerals;
                }
            },
            // room.mineralType property
            'mineralType': {
                configurable:true,
                get: function () {
                    if( _.isUndefined(this.memory.mineralType)) {
                        let minerals = this.find(FIND_MINERALS);
                        if( minerals && minerals.length > 0 )
                            this.memory.mineralType = minerals[0].mineralType;
                        else this.memory.mineralType = '';
                    }
                    return this.memory.mineralType;
                }
            },
            // room.costMatrix property
            // logic : roads costs 1, not rampart or not public structures are impassable
            'costMatrix': {
                configurable: true,
                get: function () {
                    if( _.isUndefined(Memory.pathfinder)) Memory.pathfinder = {};
                    if( _.isUndefined(Memory.pathfinder[this.name])) Memory.pathfinder[this.name] = {};

                    if( Memory.pathfinder[this.name].costMatrix && (Game.time - Memory.pathfinder[this.name].updated) < COST_MATRIX_VALIDITY) {
                        return PathFinder.CostMatrix.deserialize(Memory.pathfinder[this.name].costMatrix);
                    }

                    if( DEBUG ) logSystem(this.name, 'Calulating cost matrix');
                    var costMatrix = new PathFinder.CostMatrix;
                    let setCosts = structure => {
                        if(structure.structureType == STRUCTURE_ROAD) {
                            costMatrix.set(structure.pos.x, structure.pos.y, 1);
                        } else if(structure.structureType !== STRUCTURE_RAMPART || !structure.isPublic ) {
                            costMatrix.set(structure.pos.x, structure.pos.y, 0xFF);
                        }
                    };
                    this.structures.all.forEach(setCosts);

                    Memory.pathfinder[this.name].costMatrix = costMatrix.serialize();
                    Memory.pathfinder[this.name].updated = Game.time;
                    return costMatrix;
                }
            },
            // room.currentCostMatrix
            // logic : add creeps as impassable to room.costMatrix
            'currentCostMatrix': {
                configurable: true,
                get: function () {
                    if (_.isUndefined(this._currentCostMatrix) ) {
                        let costs = this.costMatrix;
                        // Avoid creeps in the room
                        this.allCreeps.forEach(function(creep) {
                            costs.set(creep.pos.x, creep.pos.y, 0xff);
                        });
                        this._currentCostMatrix = costs;
                    }
                    return this._currentCostMatrix;
                }
            },
            // room.my property
            'my': {
                configurable: true,
                get: function () {
                    if (_.isUndefined(this._my) ) {
                        this._my = this.controller && this.controller.my;
                    }
                    return this._my;
                }
            },
            // room.spawnQueueHigh property
            'spawnQueueHigh': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this.memory.spawnQueueHigh) ) {
                        this.memory.spawnQueueHigh = [];
                    }
                    return this.memory.spawnQueueHigh;
                }
            },
            // room.spawnQueueMedium property
            'spawnQueueMedium': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this.memory.spawnQueueMedium) ) {
                        this.memory.spawnQueueMedium = [];
                    }
                    return this.memory.spawnQueueMedium;
                }
            },
            // room.spawnQueueLow property
            'spawnQueueLow': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this.memory.spawnQueueLow) ) {
                        this.memory.spawnQueueLow = [];
                    }
                    return this.memory.spawnQueueLow;
                }
            },
            // room.pavementArt property
            'pavementArt': {
                configurable: true,
                get: function() {
                    if( _.isUndefined(this.memory.pavementArt) ) {
                        this.memory.pavementArt = [];
                    }
                    return this.memory.pavementArt;
                }
            }
        });

        // gets the best room to spawn creeps for a given flag
        Room.bestSpawnRoomFor = function(flag) {
            var range = spawn => routeRange(spawn.pos.roomName, flag.pos.roomName);
            let spawn = _.min(Game.spawns, range);

            return spawn.pos.roomName;
        }
        // get the costMatrix of a room
        Room.getCostMatrix = function(roomName) {
            var room = Game.rooms[roomName];
            if(!room) return;
            return room.costMatrix;
        };
        // check if the given room is mine
        Room.isMine = function(roomName) {
            let room = Game.rooms[roomName];
            return( room && room.my );
        };
        // check if the given room is a center one in a block
        Room.isCenterRoom = function(roomName){
            let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
            return (parsed[1] % 10 === 5) && (parsed[2] % 10 === 5);
        };
        // get adjacent rooms for a given room
        Room.adjacentRooms = function(roomName){
            let parts = roomName.split(/([N,E,S,W])/);
            let dirs = ['N','E','S','W'];
            let toggle = q => dirs[ (dirs.indexOf(q)+2) % 4 ];
            let names = [];
            for( let x = parseInt(parts[2])-1; x < parseInt(parts[2])+2; x++ ){
                for( let y = parseInt(parts[4])-1; y < parseInt(parts[4])+2; y++ ){
                    names.push( ( x < 0 ? toggle(parts[1]) + '0' : parts[1] + x ) + ( y < 0 ? toggle(parts[3]) + '0' : parts[3] + y ) );
                }
            }
            return names;
        };
        // get adjacent accessible rooms for a given room
        Room.adjacentAccessibleRooms = function(roomName, diagonal = true) {
            let validRooms = [];
            let exits = Game.map.describeExits(roomName);
            let addValidRooms = (roomName, direction) => {
                if( diagonal ) {
                    let roomExits = Game.map.describeExits(roomName);
                    let dirA = (direction + 2) % 8;
                    let dirB = (direction + 6) % 8;
                    if( roomExits[dirA] && !validRooms.includes(roomExits[dirA]) )
                        validRooms.push(roomExits[dirA]);
                    if( roomExits[dirB] && !validRooms.includes(roomExits[dirB]) )
                        validRooms.push(roomExits[dirB]);
                }
                validRooms.push(roomName);
            }
            _.forEach(exits, addValidRooms);
            return validRooms;
        };
        // get the distance between 2 rooms
        // diagonal = linear distance, continuous = how to treat borders
        Room.roomDistance = function(roomName1, roomName2, diagonal, continuous){
            if( diagonal ) return Game.map.getRoomLinearDistance(roomName1, roomName2, continuous);
            if( roomName1 == roomName2 ) return 0;
            let posA = roomName1.split(/([N,E,S,W])/);
            let posB = roomName2.split(/([N,E,S,W])/);
            let xDif = posA[1] == posB[1] ? Math.abs(posA[2]-posB[2]) : posA[2]+posB[2]+1;
            let yDif = posA[3] == posB[3] ? Math.abs(posA[4]-posB[4]) : posA[4]+posB[4]+1;
            //if( diagonal ) return Math.max(xDif, yDif); // count diagonal as 1
            return xDif + yDif; // count diagonal as 2
        };
        // get the current costMatrix of a room
        Room.getCurrentCostMatrix = function(roomName) {
            var room = Game.rooms[roomName];
            if(!room) return;
            return room.currentCostMatrix;
        };
        // get valid fields in an area
        // checkWalkable = field must be walkable, where = function (RoomPosition) => <boolean>
        Room.validFields = function(roomName, minX, maxX, minY, maxY, checkWalkable = false, where = null) {
            let look;
            if( checkWalkable ) {
                look = Game.rooms[roomName].lookAtArea(minY,minX,maxY,maxX);
            }
            let invalidObject = o => {
                return ((o.type == LOOK_TERRAIN && o.terrain == 'wall') ||
                o.type == LOOK_CONSTRUCTION_SITES ||
                (o.type == LOOK_STRUCTURES && OBSTACLE_OBJECT_TYPES.includes(o.structure.structureType) ));
            };
            let isWalkable = (posX, posY) => look[posY][posX].filter(invalidObject).length == 0;

            let fields = [];
            for( let x = minX; x <= maxX; x++) {
                for( let y = minY; y <= maxY; y++){
                    if( x > 1 && x < 48 && y > 1 && y < 48 ){
                        if( !checkWalkable || isWalkable(x,y) ){
                            let p = new RoomPosition(x, y, roomName);
                            if( !where || where(p) )
                                fields.push(p);
                        }
                    }
                }
            }
            return fields;
        };
        // get fields in range, based on args
        // args = { spots: [{pos: RoomPosition, range:1}], checkWalkable: false, where: ()=>{}, roomName: abc ) }
        Room.fieldsInRange = function(args) {
            let plusRangeX = args.spots.map(spot => spot.pos.x + spot.range);
            let plusRangeY = args.spots.map(spot => spot.pos.y + spot.range);
            let minusRangeX = args.spots.map(spot => spot.pos.x - spot.range);
            let minusRangeY = args.spots.map(spot => spot.pos.y - spot.range);
            let minX = Math.max(...minusRangeX);
            let maxX = Math.min(...plusRangeX);
            let minY = Math.max(...minusRangeY);
            let maxY = Math.min(...plusRangeY);
            return Room.validFields(args.roomName, minX, maxX, minY, maxY, args.checkWalkable, args.where);
        };

        // monkey patching the find function to accept arrays
        let find = Room.prototype.find;
        Room.prototype.find = function (c, opt) {
            if (_.isArray(c)) {
                return _(c)
                    .map(x => find.call(this, x, opt))
                    .flatten()
                    .value();
            } else
                return find.apply(this, arguments);
        };

        // gets a route from the current room to the target one
        // checkOwner = don't walk in hostile rooms (only my rooms and neutral ones are valid
        // preferHighway = prefer the < % 10 = 0 > rooms
        Room.prototype.findRoute = function(targetRoomName, checkOwner = true, preferHighway = true){
            if (this.name == targetRoomName)  return [];

            return Game.map.findRoute(this, targetRoomName, {
                routeCallback(roomName) {
                    let isHighway = false;
                    if( preferHighway ){
                        let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                        isHighway = (parsed[1] % 10 === 0) || (parsed[2] % 10 === 0);
                    }
                    let isMyOrNeutralRoom = false;
                    if( checkOwner ){
                        let room = Game.rooms[roomName];
                        isMyOrNeutralRoom = room &&
                            room.controller &&
                            (room.controller.my ||
                            (room.controller.owner === undefined));
                    }

                    if (isMyOrNeutralRoom || roomName == targetRoomName)
                        return 1;
                    else if (isHighway)
                        return 3;
                    else if( Game.map.isRoomAvailable(roomName))
                        return (checkOwner || preferHighway) ? 11 : 1;
                    return Infinity;
                }
            });

        };

        // get the best construction site in the room for a given position based on priority and range
        Room.prototype.getBestConstructionSiteFor = function(pos, filter = null) {
            let sites;
            if( filter ) sites = this.constructionSites.filter(filter);
            else sites = this.constructionSites;
            let siteOrder = [STRUCTURE_SPAWN,STRUCTURE_EXTENSION,STRUCTURE_LINK,STRUCTURE_STORAGE,STRUCTURE_TOWER,STRUCTURE_ROAD,STRUCTURE_CONTAINER,STRUCTURE_EXTRACTOR,STRUCTURE_WALL,STRUCTURE_RAMPART];
            let rangeOrder = site => {
                let order = siteOrder.indexOf(site.structureType);
                if( order < 0 ) return 100000 + pos.getRangeTo(site);
                return ((order - (site.progress / site.progressTotal)) * 100) + pos.getRangeTo(site);
            };
            return _.min(sites, rangeOrder);
        };

        // construct roads on the most frequent tiles creeps walk on
        Room.prototype.roadConstruction = function( minDeviation = ROAD_CONSTRUCTION_MIN_DEVIATION ) {

            if( !ROAD_CONSTRUCTION_ENABLE || Game.time % ROAD_CONSTRUCTION_INTERVAL != 0 ) return;
            if( _.isNumber(ROAD_CONSTRUCTION_ENABLE) && (!this.my || ROAD_CONSTRUCTION_ENABLE > this.controller.level)) return;

            let data = Object.keys(this.roadConstructionTrace)
                .map( k => {
                    return { // convert to [{key,n,x,y}]
                        'n': this.roadConstructionTrace[k], // count of steps on x,y cordinates
                        'x': k.charCodeAt(0)-32, // extract x from key
                        'y': k.charCodeAt(1)-32 // extraxt y from key
                    };
                });

            let min = Math.max(ROAD_CONSTRUCTION_ABS_MIN, (data.reduce( (_sum, b) => _sum + b.n, 0 ) / data.length) * minDeviation);

            data = data.filter( e => {
                return e.n > min &&
                    this.lookForAt(LOOK_STRUCTURES,e.x,e.y).length == 0 &&
                    this.lookForAt(LOOK_CONSTRUCTION_SITES,e.x,e.y).length == 0;
            });

            // build roads on all most frequent used fields
            let setSite = pos => {
                if( DEBUG ) logSystem(this.name, `Constructing new road at ${pos.x}'${pos.y} (${pos.n} traces)`);
                this.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
            };
            _.forEach(data, setSite);

            // clear old data
            this.roadConstructionTrace = {};
        };

        // record creeps movement in order to build roads in a smart way
        Room.prototype.recordMove = function(creep){
            if( !ROAD_CONSTRUCTION_ENABLE ) return;
            let x = creep.pos.x;
            let y = creep.pos.y;
            if ( x == 0 || y == 0 || x == 49 || y == 49 ||
                creep.carry.energy == 0 || creep.data.actionName == 'building' )
                return;

            let key = `${String.fromCharCode(32+x)}${String.fromCharCode(32+y)}_x${x}-y${y}`;
            if( !this.roadConstructionTrace[key] )
                this.roadConstructionTrace[key] = 1;
            else this.roadConstructionTrace[key]++;
        };

        // save towers in room memory
        Room.prototype.saveTowers = function(){
            //find towers
            let towers = this.find(FIND_MY_STRUCTURES, {
                filter: {structureType: STRUCTURE_TOWER}
            });
            // found towers
            if( towers.length > 0 ){
                var id = obj => obj.id;
                this.memory.towers = _.map(towers, id);
            }
            // didn't find towers
            else
                this.memory.towers = [];
        };

        // save spawns in room memory
        Room.prototype.saveSpawns = function(){
            // find spawns
            let spawns = this.find(FIND_MY_SPAWNS);
            // found spawns
            if( spawns.length > 0 ){
                let id = o => o.id;
                this.memory.spawns = _.map(spawns, id);
            }
            // didn't find spawns
            else
                this.memory.spawns = [];
        };

        // save containers in room memory and assign to sources/minerals
        // also assign terminal/storage to sources/minerals if found right
        Room.prototype.saveContainers = function(){
            this.memory.container = [];
            // find containers
            let containers = this.structures.all.filter(
                structure => structure.structureType == STRUCTURE_CONTAINER
            );
            // add for container
            let add = (cont) => {
                // find nearby mineral/source
                let minerals = this.find(FIND_MINERALS);
                let source = cont.pos.findInRange(this.sources, 2);
                let mineral = cont.pos.findInRange(minerals, 2);
                // add container to room memory
                this.memory.container.push({
                    id: cont.id,
                    source: (source.length > 0),
                    controller: ( cont.pos.getRangeTo(this.controller) < 4 ),
                    mineral: (mineral.length > 0),
                });
                // assign container to source/mineral
                let assignContainer = s => s.memory.container = cont.id;
                source.forEach(assignContainer);
                mineral.forEach(assignContainer);
            };
            // run add for each container
            containers.forEach(add);

            // check for terminal
            if( this.terminal ) {
                // look for sources/minerals
                let source = this.terminal.pos.findInRange(this.sources, 2);
                let mineral = this.terminal.pos.findInRange(this.minerals, 2);
                // assign terminal to source/mineral
                let assignTerminal = s => s.memory.terminal = this.terminal.id;
                source.forEach(assignTerminal);
                mineral.forEach(assignTerminal);
            }
            // check for storage
            if( this.storage ) {
                // look for sources/minerals
                let source = this.storage.pos.findInRange(this.sources, 2);
                let mineral = this.storage.pos.findInRange(this.minerals, 2);
                // assign storage to source/mineral
                let assignStorage = s => s.memory.storage = this.storage.id;
                source.forEach(assignStorage);
                mineral.forEach(assignStorage);

                // add storage to controller memory
                if( this.storage.pos.getRangeTo(this.controller) < 4 )
                    this.controller.memory.storage = this.storage.id;
            }
        };

        // save links in room memory
        Room.prototype.saveLinks = function(){
            // find links
            let links = this.find(FIND_MY_STRUCTURES, {
                filter: (structure) => ( structure.structureType == STRUCTURE_LINK )
            });
            // find links near storage
            let storageLinks = this.storage ? this.storage.pos.findInRange(links, 2).map(l => l.id) : [];

            this.memory.links = [];

            // for each link add to memory
            let add = (link) => {
                // check if not in memory
                if( !this.memory.links.find( (l) => l.id == link.id ) ) {
                    // look for nearby controller/source
                    let isControllerLink = ( link.pos.getRangeTo(this.controller) < 4 );
                    let isSource = false;
                    if( !isControllerLink ) {
                        let source = link.pos.findInRange(this.sources, 2);
                        let assign = s => s.memory.link = link.id;
                        source.forEach(assign);
                        isSource = source.length > 0;
                    }
                    // add link to memory
                    this.memory.links.push({
                        id: link.id,
                        storage: storageLinks.includes(link.id),
                        controller: isControllerLink,
                        source: isSource
                    });
                }
            };
            links.forEach(add);
        };

        // save minerals to memory
        Room.prototype.saveMinerals = function() {
            let that = this;
            // function : (object) => <RoomPosition object>
            let toPos = o => {
                return {
                    x: o.pos.x,
                    y: o.pos.y
                };
            };
            // get extractor position
            let extractorPos = this.structures.all.filter(
                structure => structure.structureType == STRUCTURE_EXTRACTOR
            ).map(toPos);
            // function : mineral => hasExtractor <boolean>
            let hasExtractor = m => _.some(extractorPos, {
                x: m.pos.x,
                y: m.pos.y
            });
            // get minerals with extractors
            this._minerals = this.find(FIND_MINERALS).filter(hasExtractor);
            // add to memory
            if( this._minerals.length > 0 ){
                let id = o => o.id;
                this.memory.minerals = _.map(that._minerals, id);
            }
            else
                this.memory.minerals = [];
        };
    }
};

module.exports = mod;