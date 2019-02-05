
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
    constructor(pos, action, reward, depth = 0) {
        this.pos = pos;
        this.action = action;
        this.reward = reward;
        this.depth = depth;
    }
    next(pos, reward, action) {
        return new Node(pos, this.depth ? this.action : action, reward, this.depth + 1);
    }
}

class Map {
    constructor(shape, data = 0) {
        this.shape = shape
        if (data.constructor == Array) {
            this.data = data;
        }
        else {
            this.data = [];
            length = shape[0] * shape[1];
            for (i = 0; i < length; ++i) {
                this.data.push(data);
            }
        }
    }
    
    index(pos) {
        return pos[0] * this.shape[1] + pos[1];
    }
    
    get(pos) {
        return this.data[this.index(pos)];
    }
    
    set(pos, val) {
        this.data[this.index(pos)] = val;
    }   
    
    shift(delta, fill = 0) {
        var map = new Map(this.shape, fill);
        var from, to;
        for (i = 0; i < this.shape[0]; ++i) {
            for (j = 0; j < this.shape[1]; ++j) {
                from = [i, j] 
                to = [i+delta[0], j+delta[1]];
                if (to[0] >= 0 && to[0] < this.shape[0] && to[1] >= 0 && to[1] < this.shape[1]) {
                    map.set(to, this.get(from));
                }
            }
        }
    }
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

astar_search = function(speeds, start) {
  var visited = new Map(speeds.shape, 0);
  var node = new Node(start);
  var queue = [node];
  while (queue.length) {
      node = queue.pop();
      if (visited.get(node.pos) || node.depth >= 4) {
          continue;
      }
      visited.set(node.pos, 1);
      // up
      if (node.pos[1] > 0) {
          var up = [node.pos[0], node.pos[1]-1];
          var clear = 1;
          for (i = -5; i<0; ++i) {
            if (speeds.get(up) == 1) {
              clear = 0;
              break;
            }
          }
          if (clear) {
            var shiftSpeeds = speeds.shift([0, -1]);
            var action = 1;
            var reward = brain.value_net.forward(shiftSpeeds)[action];
            queue.push(node.next(up, action, reward));
          }
      }
      if (node.pos[0] > 0) {
          var left = [node.pos[0]-1, node.pos[1]];
          var clear = 1;
          for (i = -6; i<4; ++i) {
              if (speeds.get(left) == 1) {
                  clear = 0;
                  break;
              }
          }
          if (clear) {
            var shiftSpeeds = speeds.shift([-1, 0]);
            var action = 3;
            var reward = brain.value_net.forward(shiftSpeeds)[action];
            queue.push(node.next(left, action, reward));
          }
      }
      if (node.pos[0] < map.sx) {
          var right = [node.pos[0]+1, node.pos[1]];
          var clear = 1;
          for (i = -6; i<4; ++i) {
              if (speeds.get(right) == 1) {
                  clear = 0;
                  break;
              }
          }
          if (clear) {
            var shiftSpeeds = speeds.shift([1, 0]);
            var action = 4;
            var reward = brain.value_net.forward(shiftSpeeds)[action];
            queue.push(node.next(right, action, reward));
          }
      }
      queue.sort(function (a,b){ return a.reward > b.reward; });
  }
  return node.action;
}

var lastState = 0;

learn = function (state, lastReward) {
    if (lastState) {
        brain.forward(lastState);
        brain.backward(lastReward);
    }
    lastState = state;
    var speeds = new Map([width, height], state);
    action = astar_search(speeds, [lanesSide, patchesAhead]);

    draw_net();
    draw_stats();

    return action;
}

//]]>
