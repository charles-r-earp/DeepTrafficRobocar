
//<![CDATA[

// a few things don't have var in front of them - they update already existing variables the game needs
lanesSide = 3;
patchesAhead = 50;
patchesBehind = 10;
trainIterations = 500000;

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
    num_neurons: 36,
    activation: 'relu'
});
layer_defs.push({
    type: 'fc',
    num_neurons: 24,
    activation: 'relu'
});
layer_defs.push({
    type: 'fc',
    num_neurons: 24,
    activation: 'relu'
});
layer_defs.push({
    type: 'fc',
    num_neurons: 24,
    activation: 'tanh'
});
layer_defs.push({
    type: 'regression',
    num_neurons: num_actions
});

var tdtrainer_options = {
    learning_rate: 0.001,
    momentum: 0.0,
    batch_size: 128,
    l2_decay: 0.01
};

var opt = {};
opt.temporal_window = temporal_window;
opt.experience_size = 100000;
opt.start_learn_threshold = 5000;
opt.gamma = 0.9;
opt.learning_steps_total = 500000;
opt.learning_steps_burnin = 1000;
opt.epsilon_min = 0.0;
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
