const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const stationData = require('./station.json');


//Queue class
class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    deque() {
        let value = this.heap.shift();
        return value;
    };

    isEmpty() {
        return this.heap.length == 0;
    };

    enqueue(element, cost) {
        if (this.isEmpty()) {
            this.heap.push({ element, cost });
        }
        else {
            let flag = false;
            for (let i = 1; i <= this.heap.length; i++) {
                if (cost < this.heap[i - 1][1]) {
                    this.heap.splice(i - 1, 0, { element, cost });
                    flag = true;
                    break;
                }
            }

            if (!flag) {
                this.heap.push({ element, cost });
            }
        }
    };
}

// Graph

class Graph {
    constructor() {
        this.nodes = [];
        this.adjacencylist = {};
        this.visited = {};
    }

    addnode(node) {
        this.nodes.push(node);
        this.adjacencylist[node] = [];
        this.visited[node] = 0;
    }

    addedge(node1, node2, weight) {
        this.adjacencylist[node1].push({ node2, weight });
        // this.adjacencylist[node2].push({ node1, weight });
    }

    shortestroute(start, end) {
        // let times = {};
        // var change = [];
        // let backtrack = {};

        let pq = new PriorityQueue();

        if (start == end)
            return 0;

        pq.enqueue([start], 0);

        while (!pq.isEmpty) {
            let shortest = pq.deque();
            let current = shortest[0];
            let distance = shortest[1];
            
            if (current == end) {
                console.log(distance);
                return distance;
            }

            if (this.visited[current] === 0) {
                this.visited[current] = 1;
                for (let i = 0; i < this.adjacencylist[current].length; i++) {
                    let neighbor = this.adjacencylist[current][i][0];
                    let newDistance = distance + this.adjacencylist[current][i][1];
                    pq.enqueue([neighbor, newDistance], newDistance);
                }
            }
        }

        return -1;
    }


    printGraph(s) {
        for (var i = 0; i < this.adjacencylist[s].length; i++) {
            console.log(this.adjacencylist[s][i][2]);
        }
    }

    getline(s1, s2) {
        for (let i = 0; i < this.adjacencylist[s1].length; i++) {
            if (this.adjacencylist[s1][i][0] == s2)
                return this.adjacencylist[s1][i][2];
        }
    }
}



function make_nodes() {
    var obj = new Graph();

    // Iterate through the station data
    stationData.forEach(station => {
        // Add the current station as a node
        obj.addnode(station.value);

        // Iterate through the connections of the current station
        station.connected_to.forEach(connection => {
            const connectedStation = connection[0];
            const distance = connection[1];

            // Add an edge to represent the connection between stations
            obj.addedge(station.value, connectedStation, distance);
        });
    });

    return obj;
}




// Routes

// Root route
app.get('/', (req, res) => {
    res.render('index');
});



// POST request to '/route'
app.post('/route', (req, res) => {
    const data = {
        input1: req.body.input1,
        input2: req.body.input2,
    };

    try {
        var obj = make_nodes();
        let ans = obj.shortestroute(data.input1, data.input2);
        console.log(ans);
        res.render('route', { data });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while calculating the route.');
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
