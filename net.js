
//<![CDATA[

// a few things don't have var in front of them - they update already existing variables the game needs
lanesSide = 3;
patchesAhead = 16;
patchesBehind = 8;
trainIterations = 5000;

// the number of other autonomous vehicles controlled by your network
otherAgents = 0; // max of 9

var width = lanesSide * 2 + 1;
var height = patchesAhead + patchesBehind;
var num_inputs = width * height;
var num_actions = 5;
var temporal_window = 0;

var layer_defs = [];
    layer_defs.push({
    type: 'input',
    out_sx: width,
    out_sy: height,
    out_depth: 1
});
layer_defs.push({
    type: 'fc',
    num_neurons: num_inputs/2,
    group_size: 8,
    activation: 'maxout'
});
layer_defs.push({
    type: 'regression',
    num_neurons: num_actions
});

var tdtrainer_options = {
    learning_rate: 0.01,
    momentum: 0.0,
    batch_size: 100,
    l2_decay: 0.01
};

var opt = {};
opt.temporal_window = temporal_window;
opt.experience_size = 3000;
opt.start_learn_threshold = 500;
opt.gamma = 0.7;
opt.learning_steps_total = 10000;
opt.learning_steps_burnin = 1000;
opt.epsilon_min = 0.1;
opt.epsilon_test_time = 0.0;
opt.layer_defs = layer_defs;
opt.tdtrainer_options = tdtrainer_options;

brain = new deepqlearn.Brain(num_inputs, num_actions, opt);

learn = function (state, lastReward) {
brain.backward(lastReward);
var action = brain.forward(state);

draw_net();
draw_stats();

return action;
}

//]]>
