
//define parsing table & grammar rule agian for functionality 
const parsing_data = {
    1:{ state: '0', action: { 'id': 'S5', '(': 'S4' }, goto: { 'E': '1', 'T': '2', 'F': '3' }},
    2:{ state: '1', action: { '+': 'S6', '$': 'accept' }, goto: {} },
    3:{ state: '2', action: { '+': 'R2', '*': 'S7', ')': 'R2', '$': 'R2' }, goto: {} },
    4:{ state: '3', action: { '+': 'R4', '*': 'R4', ')': 'R4', '$': 'R4' }, goto: {} },
    5:{ state: '4', action: { 'id': 'S5', '(': 'S4' }, goto: { 'E': '8', 'T': '2', 'F': '3' } },
    6:{ state: '5', action: { '+': 'R6', '*': 'R6', ')': 'R6', '$': 'R6' }, goto: {} },
    7:{ state: '6', action: { 'id': 'S5', '(': 'S4' }, goto: { 'T': '9', 'F': '3' } },
    8:{ state: '7', action: { 'id': 'S5', '(': 'S4' }, goto: { 'F': '10' } },
    9:{ state: '8', action: { '+': 'S6', ')': 'S11' }, goto: {} },
    10:{ state: '9', action: { '+': 'R1', '*': 'S7', ')': 'R1', '$': 'R1' }, goto: {} },
    11:{ state: '10', action: { '+': 'R3', '*': 'R3', ')': 'R3', '$': 'R3' }, goto: {} },
    12:{ state: '11', action: { '+': 'R5', '*': 'R5', ')': 'R5', '$': 'R5' }, goto: {} },
};
const rule = {
    1:{ left: 'E', right: ['E', '+', 'T'] },
    2:{ left: 'E', right: ['T'] },
    3:{ left: 'T', right: ['T', '*', 'F'] },
    4:{ left: 'T', right: ['F'] },
    5:{ left: 'F', right: ['(', 'E', ')'] },
    6:{ left: 'F', right: ['id'] }
};
//step by step table---look for output table body by id 
const outputT = document.getElementById("data");
function output_table(step, stack, input, action) {
    const row = document.createElement("tr");
    //fill the row with 4 columns
    row.innerHTML = `
        <td>${step}</td>
        <td>${stack}</td>
        <td>${input}</td>
        <td>${action}</td>
    `;
    //add the data to table
    outputT.appendChild(row);
}
//global value
    let step = 0, index=0, currentStep=0;
    let stack = [0];
    let output = [];

// parsing functionality
function parseInput(input) {
    step = 0, index=0, currentStep=0;
    stack = [0];
    output = [];
    //split input into tokens from "id + id" into "id", "+", "id"
    //input.trim() ignore the spaces
    const tokens = input.trim().split(/\s+/); //--input 
    //if input is null, throw errors message
    if (input.length<1)
    {
        document.getElementById("message").textContent=("Invalid input");
        return;
    }

    //first check if input comes with $, if not throw errors message
    if (!input.trim().endsWith('$'))
    {
        document.getElementById("message").textContent=("Missing $");
        return;
    }

    //step 0 
    output.push({
        step:  step,
        stack: [...stack],
        input: [...tokens],
        action: "Null"
    });
    step++;

    //while loop until error or accept
    while (true) {
        //get current state and next operator
        //stack = [0 id 5] ---> 5
        const state = stack[stack.length - 1];
        const operator = tokens[index];
        //get action: shift, reduce, or accept
        const action = action_op(state, operator);
        //error case -- if action==empty
        //eg: [a,b,c,d] -> .slice(1) -> [b,c,d] or we can use substring
        if (!action) {
            output.push({
                step: step,
                stack: [...stack],
                input: tokens.slice(index),
                action: "Error"
            });
            break;
        }
        //accept case by comparsion
        if (action == 'accept') {
            output.push({   
                step: step,
                stack: [...stack],
                input: tokens.slice(index),
                action: "Accept"
            });
            break; //end it 
        }
        //shift case -- with grammar rules
        if (action.startsWith('S')) {
            //get number part-- S5->5
            const nextState = parseInt(action.slice(1));
            stack.push(operator);
            stack.push(nextState);
            index++;
            output.push({
                step: step,
                stack: [...stack],
                input: tokens.slice(index),
                action: `Shift ${operator}`
            });
        } 
        //reduce case
        if (action.startsWith('R')) {
            //get 2 from R2
            const number = parseInt(action.slice(1));
            //get the grammar rule according to the number
            const rule1 = rule[number];
            const count = rule1.right.length * 2;

            for (let i = 0; i < count; i++) 
                {
                    stack.pop();
                }
            const topState = stack[stack.length - 1];
            const nextState = goto_op(topState, rule1.left);
            stack.push(rule1.left);
            stack.push(nextState);

            output.push({
                step: step,
                stack: [...stack],
                input: tokens.slice(index),
                action: `Reduce by ${rule1.left} → ${rule1.right.join(' ')}`
            });
        }
        step++;
    }
}
//sumbit button feature
document.getElementById("sumbit").addEventListener("click", () => {
    const inputfield = document.getElementById("input"); //inputFeild is not a string, cant use it directly
    const input_value = inputfield.value;
    outputT.innerHTML = ""; //make sure clear the previous history
    parseInput(input_value); // transfer parameter to the parsing function
    show_process();
});

//next buttom -- show each process one by one
document.getElementById("next").addEventListener("click", show_process);
function show_process() {
    if (currentStep < output.length) {
        const step = output[currentStep];
        output_table(step.step, step.stack.join(' '), step.input.join(' '), step.action);
        currentStep++;
    } 
    else
    document.getElementById('next').disabled=true;
}

function action_op(state, operator) {
    //Object.values() finding through numbers
    const row = Object.values(parsing_data).find(r => r.state == state);
    return row?.action[operator];
}

function goto_op(state, goto_value) {
    const row = Object.values(parsing_data).find(r => r.state == state);
    return parseInt(row?.goto[goto_value]);
}