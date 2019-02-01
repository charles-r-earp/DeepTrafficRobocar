
//<![CDATA[

// a few things don't have var in front of them - they update already existing variables the game needs
lanesSide = 8;
patchesAhead = 52;
patchesBehind = 18;

// the number of other autonomous vehicles controlled by your network
otherAgents = 0; // max of 10

var width = lanesSide * 2 + 1;
var height = patchesAhead + patchesBehind;
var num_inputs = (lanesSide * 2 + 1) * (patchesAhead + patchesBehind);
var num_actions = 5;
var temporal_window = 0;
//var network_size = num_inputs * temporal_window + num_actions * temporal_window + num_inputs;

remap_occupied = function(state) {
    for (i = 0; i<num_inputs; ++i) {
        state[i] = state[i] == 1 ? 1 : 0;
    }
    return state;
}

astar_search = function(map, start) {
  occupied = new convnetjs.Vol(width, height, 1);
  occupied.w = state;
  visited = new convnetjs.Vol(width, height, 1, 0);
  queue = 

learn = function (state, lastReward) {
    map = new convnetjs.Vol(width, height, 1, 0);
    map.w = remap_occupied(state);
    
    var action = astar_search(map, [lanesSide, patchesAhead]);

    draw_stats();

    return 0;
}

//]]>
