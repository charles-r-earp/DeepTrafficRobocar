
//<![CDATA[

// a few things don't have var in front of them - they update already existing variables the game needs
lanesSide = 1;
patchesAhead = 8;
patchesBehind = 8;

// the number of other autonomous vehicles controlled by your network
otherAgents = 0; // max of 10

var width = lanesSide * 2 + 1;
var height = patchesAhead + patchesBehind;
var num_inputs = (lanesSide * 2 + 1) * (patchesAhead + patchesBehind);
var num_actions = 5;
var temporal_window = 0;
//var network_size = num_inputs * temporal_window + num_actions * temporal_window + num_inputs;

//https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript
/*class PriorityQueue {
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
}*/
//

class Node {
    constructor(pos, action = 0, depth = 0) {
        this.pos = pos;
        this.action = action;
        this.heuristic = pos[1];
        this.cost = this.heuristic + depth;
    }
    next(pos, action) {
        return Node(pos, this.depth ? this.action : action, this.depth + 1);
    }
}
        
astar_search = function(map, start) {
  //var queue = new PriorityQueue((a, b) => a.cost < b.cost);
  //queue.push(new Node(start));
  var queue = [new Node(start)];
  while (1) {
      var node = queue.pop();
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
            //return 1;
            queue.push(node.next(up, 1));
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
              //return 3;
              queue.push(node.next(left, 3));
          }
      }
      if (node.pos[0] > 0) {
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
              //return 4;
              queue.push(node.next(right, 4));
          }
      }
      return 4;
  }
  return 0;
}

learn = function (state, lastReward) {
    var map = new convnetjs.Vol(width, height, 1, 0);
    for (i = 0; i<state.length; ++i) {
        map.w[i] = state[i] == 1 ? 0 : 1;
    }
    for (i = 0; i<4; ++i) {
        map.set(lanesSide, patchesAhead-4+1, 1, 0);
    }
    var action = astar_search(map, [lanesSide, patchesAhead]);

    draw_stats();

    return action;
}

//]]>
