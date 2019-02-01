
//<![CDATA[

// a few things don't have var in front of them - they update already existing variables the game needs
lanesSide = 8;
patchesAhead = 52;
patchesBehind = 18;
trainIterations = 40000;

// the number of other autonomous vehicles controlled by your network
otherAgents = 0; // max of 10

var width = lanesSide * 2 + 1;
var height = patchesAhead + patchesBehind;
var num_inputs = (lanesSide * 2 + 1) * (patchesAhead + patchesBehind);
var num_actions = 5;
var temporal_window = 0;
//var network_size = num_inputs * temporal_window + num_actions * temporal_window + num_inputs;

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
opt.start_learn_threshold = 500;
opt.gamma = 0.1;
opt.learning_steps_total = trainIterations;
opt.learning_steps_burnin = 1000;
opt.epsilon_min = 0.0;
opt.epsilon_test_time = 0.0;
opt.layer_defs = layer_defs;
opt.tdtrainer_options = tdtrainer_options;

brain = new deepqlearn.Brain(num_inputs, num_actions, opt);

occupied = function(state) {
    for (i = 0; i<num_inputs; ++i) {
        state[i] = state[i] == 1 ? 1 : -1;
    }
    return state;
}

learn = function (state, lastReward) {
    brain.backward(lastReward);
    state = occupied(state);
    var action = brain.forward(state);

    draw_net();
    draw_stats();

    return action;
}

//]]>
