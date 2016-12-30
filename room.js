// room server object extend

var mod = {
    extend: function () {
        // TODO : copy and comment on the code from OBS


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