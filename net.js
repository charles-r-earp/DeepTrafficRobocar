
//<![CDATA[

// a few things don't have var in front of them - they update already existing variables the game needs
lanesSide = 3;
patchesAhead = 12;
patchesBehind = 8;
trainIterations = 5000;

var num_inputs = (lanesSide * 2 + 1) * (patchesAhead + patchesBehind);
var num_actions = 5;
var temporal_window = 0;

var input_size = num_inputs * (temporal_window+1) + num_actions * temporal_window;

var layer_defs = [];
layer_defs.push({
    type: 'input',
    out_sx: 1,
    out_sy: 1,
    out_depth: input_size
});
layer_defs.push({
    type: 'fc',
    num_neurons: input_size / 2,
    activation: 'relu'
});
layer_defs.push({
    type: 'fc',
    num_neurons: input_size / 4,
    activation: 'relu'
});
layer_defs.push({
    type: 'fc',
    num_neurons: input_size / 8,
    activation: 'relu'
});
layer_defs.push({
    type: 'regression',
    num_neurons: num_actions
});

var tdtrainer_options = {
    learning_rate: 0.001,
    momentum: 0.5,
    batch_size: 64,
    l2_decay: 0.05
};

var opt = {};
opt.temporal_window = temporal_window;
opt.experience_size = 3000;
opt.start_learn_threshold = 500;
opt.gamma = 0.8;
opt.learning_steps_total = 10000;
opt.learning_steps_burnin = 1000;
opt.epsilon_min = 0.3;
opt.epsilon_test_time = 0.1;
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
