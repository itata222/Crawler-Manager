const Queue=require('./queue')
class Node {
  constructor(value) {
      this.value = value;
      this.depth=null;
      this.childrens=[];
  }

  setDepth(depth){
      this.depth=depth;
      return this;
  }

  setChildren(value){
    this.childrens=this.childrens.concat(new Node(value))
    return this;
  }
}


class Tree {
  constructor() {
      this.root = null;
  }

  insert(value) {
      const newNode = new Node(value);
      if (this.root == undefined) {
          this.root = newNode;
          return this;
      }

      let currentNode = this.root;
      while (currentNode != null) {

        //   if (currentNode.value === value) return this;
        //   if (currentNode.value > value) {
        //       if (currentNode.left == null) {
        //           currentNode.left = newNode;
        //           return this;
        //       } else {
        //           currentNode = currentNode.left;
        //       }
        //   } else {
        //       if (currentNode.right == null) {
        //           currentNode.right = newNode;
        //           return this;
        //       } else {
        //           currentNode = currentNode.right;
        //       }
        //   }
      }
  }

  includes(value) {
      let currentNode = this.root;
      while (currentNode != undefined) {
          if (currentNode.value === value) return true;
          if (currentNode.value > value) currentNode = currentNode.left;
          else currentNode = currentNode.right;
      }
      return false;
  }

  bfsTraveres() {
      if (this.root == null) return [];
      const valuesArray = [];
      const q = new Queue();
      q.enqueue(this.root);
      while (q.size > 0) {
          const currentNode = q.dequeue();
          valuesArray.push(currentNode.value);
          if (currentNode.left != null) q.enqueue(currentNode.left);
          if (currentNode.right != null) q.enqueue(currentNode.right);
      }

      return valuesArray;
  }
}


module.exports=Tree