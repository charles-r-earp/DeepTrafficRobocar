
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

//https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript
class PriorityQueue {
  constructor(comparator = (a, b) => a > b) {
    this._heap = [];
    this._comparator = comparator;
  }
  size() {
    return this._heap.length;
  }
  isEmpty() {
    return this.size() == 0;
  }
  peek() {
    return this._heap[top];
  }
  push(...values) {
    values.forEach(value => {
      this._heap.push(value);
      this._siftUp();
    });
    return this.size();
  }
  pop() {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > top) {
      this._swap(top, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }
  replace(value) {
    const replacedValue = this.peek();
    this._heap[top] = value;
    this._siftDown();
    return replacedValue;
  }
  _greater(i, j) {
    return this._comparator(this._heap[i], this._heap[j]);
  }
  _swap(i, j) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }
  _siftUp() {
    let node = this.size() - 1;
    while (node > top && this._greater(node, parent(node))) {
      this._swap(node, parent(node));
      node = parent(node);
    }
  }
  _siftDown() {
    let node = top;
    while (
      (left(node) < this.size() && this._greater(left(node), node)) ||
      (right(node) < this.size() && this._greater(right(node), node))
    ) {
      let maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
}
//

class Node {
    constructor(pos) {
        this.actions = [];
        this.path = [pos];
        this.heuristic = pos[1];
        this.cost = this.heuristic;
    }
    next() {
        pos = this.path[length - 1];
        

astar_search = function(map, start) {
  occupied = new convnetjs.Vol(width, height, 1);
  occupied.w = state;
  visited = new convnetjs.Vol(width, height, 1, 0);
  queue = new PriorityQueue((a, b) => a.cost < b.cost);
  queue.push(

learn = function (state, lastReward) {
    map = new convnetjs.Vol(width, height, 1, 0);
    map.w = remap_occupied(state);
    
    var action = astar_search(map, [lanesSide, patchesAhead]);

    draw_stats();

    return 0;
}

//]]>
