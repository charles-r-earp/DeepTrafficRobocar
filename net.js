
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
var num_actions = 3;
var temporal_window = 0;
//var network_size = num_inputs * temporal_window + num_actions * temporal_window + num_inputs;

class Node {
    constructor(pos, action = 0, reward = 0, depth = 0) {
        this.pos = pos;
        this.action = action;
        this.reward = reward;
        this.depth = depth;
    }
    next(pos, action, reward = 0) {
        return new Node(pos, this.depth ? this.action : action, reward, this.depth + 1);
    }
}


class Map {
    constructor(shape, data) {
        this.shape = shape;
        if (data.constructor == Array) {
            this.data = data;
        }
        else {
            this.data = [];
            var length = shape[0] * shape[1];
            for (var i = 0; i < length; ++i) {
                this.data.push(data);
            }
        }
    }
    index(pos) {
        return pos[0] + pos[1] * this.shape[0];
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
        for (var i = 0; i < this.shape[0]; ++i) {
            for (var j = 0; j < this.shape[1]; ++j) {
                from = [i, j] 
                to = [i+delta[0], j+delta[1]];
                if (to[0] >= 0 && to[0] < this.shape[0] && to[1] >= 0 && to[1] < this.shape[1]) {
                    map.set(to, this.get(from));
                }
            }
        }
        return map;
    }
}

var layer_defs = [];
layer_defs.push({
    type: 'input',
    out_sx: 1,
    out_sy: 1,
    out_depth: num_inputs
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
opt.epsilon_min = 0;
opt.epsilon_test_time = 0.0;
opt.layer_defs = layer_defs;
opt.tdtrainer_options = tdtrainer_options;

brain = new deepqlearn.Brain(num_inputs, num_actions, opt);

astar_search = function(speeds, start) {
  var visited = new Map(speeds.shape, 0);
  var node = new Node(start, 2);
  var queue = [node];
  while (queue.length) {
      node = queue.pop();
      if (visited.get(node.pos)) {
          continue;
      }
      if (node.pos[1] < start[1]) {
          return node.action;
      }
      visited.set(node.pos, 1);
      // up
      if (node.pos[1] > 0 && node.depth > 0) {
          var up = [node.pos[0], node.pos[1]-1];
          var clear = 1;
          for (var i = -5; i<0; ++i) {
            if (speeds.get([up[0], up[1]+i]) != 1) {
              clear = 0;
              break;
            }
          }
          if (clear && !visited.get(up)) {
            var shiftSpeeds = speeds.shift([0, -1]);
            var v = new convnetjs.Vol(1, 1, shiftSpeeds.data.length);
            v.w = shiftSpeeds.data;
            var action = 0;
            var reward = 0;//brain.value_net.forward(v)[action];
            queue.push(node.next(up, 0));
          }
      }
      if (node.pos[0] > 0) {
          var left = [node.pos[0]-1, node.pos[1]];
          var clear = 1;
          for (var i = -6; i<4; ++i) {
              if (speeds.get([left[0], left[1]+i]) != 1) {
                  clear = 0;
                  break;
              }
          }
          if (clear && !visited.get(left)) {
            var shiftSpeeds = speeds.shift([-1, 0]);
            var v = new convnetjs.Vol(1, 1, shiftSpeeds.data.length);
            v.w = shiftSpeeds.data;
            var action = 1;
            var reward = 0;//brain.value_net.forward(v)[action];
            queue.push(node.next(left, 1));
          }
      }
      if (node.pos[0] < visited.shape[0]) {
          var right = [node.pos[0]+1, node.pos[1]];
          var clear = 1;
          for (var i = -6; i<4; ++i) {
              if (speeds.get([right[0], right[0]+i]) != 1) {
                  clear = 0;
                  break;
              }
          }
          if (clear && !visited.get(right)) {
            var shiftSpeeds = speeds.shift([1, 0]);
            var v = new convnetjs.Vol(1, 1, shiftSpeeds.data.length);
            v.w = shiftSpeeds.data;
            var action = 2;
            var reward = 0;//brain.value_net.forward(v)[action];
            queue.push(node.next(right, 2));
          }
      }
      queue.sort(function (a,b){ return a.pos[0] < b.pos[0]; });
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
    var action = astar_search(speeds, [lanesSide, patchesAhead]);
    draw_net();
    draw_stats();

    return action ? action + 2 : 0;
}

//]]>
