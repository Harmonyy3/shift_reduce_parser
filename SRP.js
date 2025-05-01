
//define parsing table & grammar rule agian for functionality 
const parsing_data = {
    row: [
        { state: '0', action: { 'id': 'S5', '(': 'S4' }, goto: { 'E': '1', 'T': '2', 'F': '3' }},
        { state: '1', action: { '+': 'S6', '$': 'accept' }, goto: {} },
        { state: '2', action: { '+': 'R2', '*': 'S7', ')': 'R2', '$': 'R2' }, goto: {} },
        { state: '3', action: { '+': 'R4', '*': 'R4', ')': 'R4', '$': 'R4' }, goto: {} },
        { state: '4', action: { 'id': 'S5', '(': 'S4' }, goto: { 'E': '8', 'T': '2', 'F': '3' } },
        { state: '5', action: { '+': 'R6', '*': 'R6', ')': 'R6', '$': 'R6' }, goto: {} },
        { state: '6', action: { 'id': 'S5', '(': 'S4' }, goto: { 'T': '9', 'F': '3' } },
        { state: '7', action: { 'id': 'S5', '(': 'S4' }, goto: { 'F': '10' } },
        { state: '8', action: { '+': 'S6', ')': 'S11' }, goto: {} },
        { state: '9', action: { '+': 'R1', '*': 'S7', ')': 'R1', '$': 'R1' }, goto: {} },
        { state: '10', action: { '+': 'R3', '*': 'R3', ')': 'R3', '$': 'R3' }, goto: {} },
        { state: '11', action: { '+': 'R5', '*': 'R5', ')': 'R5', '$': 'R5' }, goto: {} },
    ]
};
const rule = {
    1:{ left: 'E', right: ['E', '+', 'T'] },
    2:{ left: 'E', right: ['T'] },
    3:{ left: 'T', right: ['T', '*', 'F'] },
    4:{ left: 'T', right: ['F'] },
    5:{ left: 'F', right: ['(', 'E', ')'] },
    6:{ left: 'F', right: ['id'] }
};
// parsing functionality
function parseInput(input) {
    // split input into tokens from "id + id" into "id", "+", "id"
    const tokens = input.trim().split(/\s+/);  
    let stack = [0];
    let pointer = 0;
    let step = 0;
    parsingSteps = [];
    currentStep = 0;

    //initilize the process with step 0
    parsingSteps.push({
        step:  step,
        stack: [...stack],
        input: [...tokens],
        action: " "
    });
    step++;

    //while loop until error or accept
    while (true) {
        //get current state and next symbol
        const state = stack[stack.length - 1];
        const symbol = tokens[pointer];
        //get action: shift, reduce, or accept
        const action = getAction(state, symbol);
        //error case
        if (!action) {
            parsingSteps.push({
                step: step,
                stack: [...stack],
                input: tokens.slice(pointer),
                action: "Error"
            });
            break;
        }
        //accept case
        if (action === 'accept') {
            parsingSteps.push({
                step: step,
                stack: [...stack],
                input: tokens.slice(pointer),
                action: "Accept"
            });
            break;
        }
        //shift case
        if (action.startsWith('S')) {
            //only get number part-- S5->5
            const nextState = parseInt(action.slice(1));
            stack.push(symbol);
            stack.push(nextState);
            pointer++;
            parsingSteps.push({
                step: step,
                stack: [...stack],
                input: tokens.slice(pointer),
                action: `Shift ${symbol}`
            });
        } 
        //reduce case
        if (action.startsWith('R')) {
            //get 2 from R2
            const ruleNum = parseInt(action.slice(1));
            //get the grammar rule according to the number
            const rule = grammar_rule(ruleNum);
            const popCount = rule.right.length * 2;

            for (let i = 0; i < popCount; i++) stack.pop();

            const topState = stack[stack.length - 1];
            const nextState = getGoto(topState, rule.left);
            stack.push(rule.left);
            stack.push(nextState);

            parsingSteps.push({
                step: step,
                stack: [...stack],
                input: tokens.slice(pointer),
                action: `Reduce by ${rule.left} → ${rule.right.join(' ')}`
            });
        }
        step++;
    }
}


document.getElementById("sumbit").addEventListener("click", () => {
    const inputField = document.getElementById("input");
    const input = inputField.value;
    outputTable.innerHTML = ""; 
    parseInput(input);
    document.getElementById('next').disabled = false;
    showNextStep();
});

document.getElementById("next").addEventListener("click", showNextStep);

function showNextStep() {
    if (currentStep < parsingSteps.length) {
        const step = parsingSteps[currentStep];
        output_table(step.step, step.stack.join(' '), step.input.join(' '), step.action);
        currentStep++;
    } 
}

function getAction(state, symbol) {
    const row = parsing_data.row.find(r => r.state === state.toString());
    return row?.action[symbol];
}

function getGoto(state, nonTerm) {
    const row = parsing_data.row.find(r => r.state === state.toString());
    return parseInt(row?.goto[nonTerm]);
}

//output table section
const outputTable = document.querySelector("#output tbody");

function output_table(step, stack, input, action) {
    const row = document.createElement("tr");
    //fill the row with 4 columns
    row.innerHTML = `
        <td>${step}</td>
        <td>${stack}</td>
        <td>${input}</td>
        <td>${action}</td>
    `;
    //add the row to table
    outputTable.appendChild(row);
}