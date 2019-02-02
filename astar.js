
//<![CDATA[

// a few things don't have var in front of them - they update already existing variables the game needs
lanesSide = 6;
patchesAhead = 52;
patchesBehind = 20;
trainIterations = 40000;

// the number of other autonomous vehicles controlled by your network
otherAgents = 0; // max of 10

var width = lanesSide * 2 + 1;
var height = patchesAhead + patchesBehind;
var num_inputs = (lanesSide * 2 + 1) * (patchesAhead + patchesBehind);
var num_actions = 5;
var temporal_window = 0;
//var network_size = num_inputs * temporal_window + num_actions * temporal_window + num_inputs;

class Node {
    constructor(pos, action = 0, depth = 0) {
        this.pos = pos;
        this.action = action;
        this.heuristic = pos[1];
        this.cost = depth;
        this.depth = depth;
    }
    next(pos, action) {
        return new Node(pos, this.depth ? this.action : action, this.depth + 1);
    }
}
        
astar_search = function(map, start) {
  var node = new Node(start);
  var queue = [node];
  while (queue.length) {
      node = queue.pop();
      if (node.pos[1] == 3) {
          return node.action;
      }
      if (node.pos[1] > 0) {
          var up = [node.pos[0], node.pos[1]-1];
          var clear = 1;
          for (i = -5; i<0; ++i) {
            if (map.get(up[0], up[1]+i, 0)) {
              clear = 0;
              break;
            }
          }
          if (clear) {
            map.set(up[0], up[1], 0, 1);
            queue.push(node.next(up, 1));
          }
      }
      if (node.pos[1] < map.sy-4) {
          var down = [node.pos[0], node.pos[1]-1];
          var clear = 1;
          for (i = 0; i<5; ++i) {
            if (map.get(down[0], down[1]+i, 0)) {
              clear = 0;
              break;
            }
          }
          if (clear) {
            map.set(down[0], down[1], 0, 1);
            queue.push(node.next(down, 1));
          }
      }
      if (node.pos[0] > 0) {
          var left = [node.pos[0]-1, node.pos[1]];
          var clear = 1;
          for (i = -6; i<4; ++i) {
              if (map.get(left[0], left[1]+i, 0)) {
                  clear = 0;
                  break;
              }
          }
          if (clear) {
              map.set(left[0], left[1], 0, 1);
              queue.push(node.next(left, 3));
          }
      }
      if (node.pos[0] < map.sx) {
          var right = [node.pos[0]+1, node.pos[1]];
          var clear = 1;
          for (i = -6; i<4; ++i) {
              if (map.get(right[0], right[1]+i, 0)) {
                  clear = 0;
                  break;
              }
          }
          if (clear) {
              map.set(right[0], right[1], 0, 1);
              queue.push(node.next(right, 4));
          }
      }
      queue.sort(function (a,b){ return a.cost < b.cost; });
  }
  return node.action;
}

var layer_defs = [];
layer_defs.push({
    type: 'input',
    out_sx: width,
    out_sy: height,
    out_depth: 1
});
layer_defs.push({
    type: 'regression',
    num_neurons: num_actions
});

var tdtrainer_options = {
    learning_rate: 0.001,
    momentum: 0.0,
    batch_size: 64,
    l2_decay: 0.01
};

var opt = {};
opt.temporal_window = temporal_window;
opt.experience_size = 3000;
opt.start_learn_threshold = 0;
opt.gamma = 0.98;
opt.learning_steps_total = trainIterations;
opt.learning_steps_burnin = 0;
opt.epsilon_min = 0.0;
opt.epsilon_test_time = 0.0;
opt.layer_defs = layer_defs;
opt.tdtrainer_options = tdtrainer_options;

brain = new deepqlearn.Brain(num_inputs, num_actions, opt);

learn = function (state, lastReward) {
    var map = new convnetjs.Vol(width, height, 1, 0);
    for (i = 0; i<state.length; ++i) {
        map.w[i] = state[i] == 1 ? 0 : 1;
    }
    for (i = 0; i<4; ++i) {
        map.set(lanesSide, patchesAhead-4+1, 1, 0);
    }
    brain.backward(lastReward);
    brain.forward(map.w);
    action = astar_search(map, [lanesSide, patchesAhead]);

    draw_net();
    draw_stats();

    return action;
}

//]]>
