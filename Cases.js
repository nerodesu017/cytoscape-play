const fs = require('fs');
const t = require('@babel/types');

module.exports = class Cases {
  constructor(path) {
    if (!Cases.isControlFlowSwitchCase(path)) return;
    this.nodes_cases = path.node.body.body[0].cases;
    let jmp_var_path = path.getPrevSibling();
    this.jmp_var_name = String(jmp_var_path.node.declarations[0].id.name);
    this.mapCaseToNextCases();
    console.log(this.map_case_to_next_cases);
    this.writeToFile();
  }
  mapCaseToNextCases() {
    this.map_case_to_next_cases = new Map();
    this.nodes_cases.forEach(node => {
      let next_nodes = [];
      if (t.isExpressionStatement(node.consequent[this.getNodeIndexBeforeBreakStatement(node)])) next_nodes = this.getNextNodes(node.consequent[this.getNodeIndexBeforeBreakStatement(node)]);
      this.map_case_to_next_cases.set(node.test.value, next_nodes);
    })
  }
  getNodeIndexBeforeBreakStatement(node) {
    if (node.consequent.length === 1 && t.isBreakStatement(node.consequent[0]))
      throw new Error("Tried to find the node before a BreakStatement node but there is none");
    return t.isBreakStatement(node.consequent[node.consequent.length - 1]) ? node.consequent.length - 2 : node.consequent.length - 1;
  };
  getNextNodes(node){
    var node_assignExpr = (node.expression);
    if (t.isNumericLiteral(node_assignExpr.right)) {
      return [node_assignExpr.right.value];
    }
    else if (t.isConditionalExpression(node_assignExpr.right)) {
      return [node_assignExpr.right.consequent.value, node_assignExpr.right.alternate.value];
    }
    return [];
  };
  writeToFile() {
    var _this = this;
    fs.writeFileSync('./html/cases.js', `var cases = ${JSON.stringify(Object.fromEntries(_this.map_case_to_next_cases))}`);
  }
  static isControlFlowSwitchCase(path) {
    return !(path.node.init ||
      path.node.update ||
      !t.isBinaryExpression(path.node.test) ||
      !t.isIdentifier(path.node.test.left) ||
      !t.isNumericLiteral(path.node.test.right) ||
      path.node.test.operator !== "!==" ||
      !t.isBlockStatement(path.node.body) ||
      path.node.body.body.length !== 1 ||
      !t.isSwitchStatement(path.node.body.body[0]) ||
      !t.isNumericLiteral(path.node.body.body[0].cases[0].test));
  };
}

