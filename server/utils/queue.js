
class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class Queue {
    constructor() {
        this.first = null;
        this.last = null;
        this.size = 0;
    }

    enqueue(value) {
        const newNode = new Node(value);
        if (this.size === 0) this.first = newNode;
        else this.last.next = newNode;

        this.last = newNode;
        return ++this.size;
    }


    dequeue() {
        if (this.size === 0) return;
        const firstNode = this.first;
        this.first = this.first.next;
        this.size--;
        if (this.size === 0) this.last = this.first;
        return firstNode.value;
    }
    // O(1)
}

// const q = new Queue();
// q.enqueue(1);
// q.enqueue(2);
// q.enqueue(3);
// console.log(q.dequeue());
// console.log(q.dequeue());
// console.log(q.dequeue());

module.exports = Queue;