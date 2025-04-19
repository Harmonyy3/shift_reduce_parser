
function createSRPTable(data) {
    const table = document.createElement('table');
    const style = document.createElement('style');
    style.textContent = `
        td,th {
            border: 1px solid black;
            
        }
        th {
            background-color: pink;
        } 
    `;

    document.head.appendChild(style);

    const headerRow1 = document.createElement('tr');
    
    const stateHeader = document.createElement('th');

    //state column header
    stateHeader.textContent = 'State';
    stateHeader.rowSpan = 2;
    headerRow1.appendChild(stateHeader);

    const actionHeader = document.createElement('th');
    //action column header
    actionHeader.textContent = 'Action';
    actionHeader.colSpan = data.terminals.length;
    headerRow1.appendChild(actionHeader);

    const gotoHeader = document.createElement('th');
    //goto column header
    gotoHeader.textContent = 'Goto';
    gotoHeader.colSpan = data.nonTerminals.length;
    headerRow1.appendChild(gotoHeader);

    table.appendChild(headerRow1);

    const headerRow2 = document.createElement('tr');

    //action column
    data.terminals.forEach(term => {
        const th = document.createElement('th');
        th.textContent = term;
        headerRow2.appendChild(th);
    });

    //goto column
    data.nonTerminals.forEach(nonTerm => {
        const th = document.createElement('th');
        th.textContent = nonTerm;
        headerRow2.appendChild(th);
    });

    table.appendChild(headerRow2);

    //state row
    data.rows.forEach(row => {
        const tr = document.createElement('tr');
        const stateCell = document.createElement('td');
        stateCell.textContent = row.state;
        stateCell.style.backgroundColor = 'pink'; 
        tr.appendChild(stateCell);

        data.terminals.forEach(term => {
            const td = document.createElement('td');
            td.textContent = row.actions[term] || '';
            tr.appendChild(td);
        });

        data.nonTerminals.forEach(nonTerm => {
            const td = document.createElement('td');
            td.textContent = row.gotos[nonTerm] || '';
            tr.appendChild(td);
        });

        table.appendChild(tr);
    });

    return table;
}

//table data
const srpTableData = {
    //action columns
    terminals: ['id', '+', '*', '(', ')', '$'], 
    //goto columns
    nonTerminals: ['E', 'T', 'F'], 
    rows: [
        { state: '0', actions: { 'id': 'S5', '(': 'S4' }, gotos: { 'E': '1', 'T': '2', 'F': '3' } },
        { state: '1', actions: { '+': 'S6', '$': 'accept' }, gotos: {} },
        { state: '2', actions: { '+': 'R2', '*': 'S7', ')': 'R2', '$': 'R2' }, gotos: {} },
        { state: '3', actions: { '+': 'R4', '*': 'R4', ')': 'R4', '$': 'R4' }, gotos: {} },
        { state: '4', actions: { 'id': 'S5', '(': 'S4' }, gotos: { 'E': '8', 'T': '2', 'F': '3' } },
        { state: '5', actions: { '+': 'R6', '*': 'R6', ')': 'R6', '$': 'R6' }, gotos: {} },
        { state: '6', actions: { 'id': 'S5', '(': 'S4' }, gotos: { 'T': '9', 'F': '3' } },
        { state: '7', actions: { 'id': 'S5', '(': 'S4' }, gotos: { 'F': '10' } },
        { state: '8', actions: { '+': 'S6', ')': 'S11' }, gotos: {} },
        { state: '9', actions: { '+': 'R1', '*': 'S7', ')': 'R1', '$': 'R1' }, gotos: {} },
        { state: '10', actions: { '+': 'R3', '*': 'R3', ')': 'R3', '$': 'R3' }, gotos: {} },
        { state: '11', actions: { '+': 'R5', '*': 'R5', ')': 'R5', '$': 'R5' }, gotos: {} },
    ]
};
// Get HTML element to display SRP_TABLE
const parserContainer = document.getElementById("parser-context");
//create table by datas
parserContainer.appendChild(createSRPTable(srpTableData));
//create table where it shows individual steps
const outputTable = document.querySelector("#output tbody");

//output table section
let currentStep = 0;
let parsingSteps = [];
let isParsingComplete = false;

function addOutputRow(step, stack, input, action) {
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

// parsing
function parseInput(input) {
    //check for proper input firstly --- $
    if (!input.trim().endsWith('$')) {
        parsingSteps = [{
            step: 0,
            stack: [],
            input: input.split(/\s+/),
            action: "Error: Missing '$'"
        }];
        return; 
    }

    // split input into tokens from "id + id" into "id", "+", "id"
    const tokens = input.trim().split(/\s+/);  
    let stack = [0];
    let pointer = 0;
    let step = 0;
    parsingSteps = [];
    currentStep = 0;
    isParsingComplete = false;

    //initilize the process with step 0
    parsingSteps.push({
        step:step,
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
            const rule = getRule(ruleNum);
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

function showNextStep() {
    if (currentStep < parsingSteps.length) {
        const step = parsingSteps[currentStep];
        addOutputRow(step.step, step.stack.join(' '), step.input.join(' '), step.action);
        currentStep++;
    } else if (!isParsingComplete) {
        isParsingComplete = true;
        document.getElementById('next-step').disabled = true;
    }
}

document.getElementById("input-submit").addEventListener("click", () => {
    const inputField = document.getElementById("inputg");
    const input = inputField.value;
    outputTable.innerHTML = ""; // Clear previous output
    parseInput(input);
    document.getElementById('next-step').disabled = false;
    showNextStep();
});

document.getElementById("next-step").addEventListener("click", showNextStep);

function getAction(state, symbol) {
    const row = srpTableData.rows.find(r => r.state === state.toString());
    return row?.actions[symbol];
}

function getGoto(state, nonTerm) {
    const row = srpTableData.rows.find(r => r.state === state.toString());
    return parseInt(row?.gotos[nonTerm]);
}

function getRule(num) {
    const rules = [
        { left: 'E', right: ['E', '+', 'T'] },
        { left: 'E', right: ['T'] },
        { left: 'T', right: ['T', '*', 'F'] },
        { left: 'T', right: ['F'] },
        { left: 'F', right: ['(', 'E', ')'] },
        { left: 'F', right: ['id'] }
    ];
    return rules[num - 1];
}
