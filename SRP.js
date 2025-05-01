//define parsing table & grammar rule agian for functionality 
//easier to identify with number object
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
//global value
    let step = 0, index=0, current_step=0;
    let stack = [0];
    let output = [];
// parsing functionality
function start_parsing(input) {
    step = 0, index=0, current_step=0;
    stack = [0];
    output = [];
    //split input into tokens from "id + id" into "id", "+", "id"
    //input.trim() ignore the spaces
    const tokens = input.trim().split(/\s+/); //--input 
    //if tokens is null, throw errors message
    if (tokens.length<1)
    {
        document.getElementById("message").textContent=("Invalid input");
        return;
    }

    //first check if tokens comes with $, if not throw errors message
    if (tokens[tokens.length-1]!=('$'))
    {
        document.getElementById("message").textContent=("Missing $");
        return;
    }

    //step 0 for iniatilization
    output.push({
        step:  step,
        stack: [...stack],
        input: [...tokens],
        action: "Null"
    });
    step++;

    //while loop until error or accept
    while (true) {
        //get current state num and next operator symbol
        //stack = [0 id 5] ---> 5 --- to get the last stack
        const state = stack[stack.length - 1];//rows num
        const operator = tokens[index];//columns
        //action_op(rows, columns) --> result == shift || reduce || accept
        //if (rows, columns) fall into a empty spot then it is error case
        const result = action_op(state, operator);
        //error case -- if result is empty
        //eg: [a,b,c,d] -> .slice(1) -> [b,c,d] or we can use substring
        if (!result) {
            output.push({
                step: step,
                stack: [...stack],
                input: tokens.slice(index),
                action: "Error"
            });
            break;//break the loop
        }
        //accept case by comparsion
        if (result == 'accept') {
            output.push({   
                step: step,
                stack: [...stack],
                input: tokens.slice(index),
                action: "Accept"
            });
            break; //break the loop
        }
        //shift case
        if (result[0]==('S')) {
            //slice() get number part-- 'S5'->'5'
            //parseInt() converts a string to num, so '5' -> 5
            const num = parseInt(result.slice(1));
            stack.push(operator);
            stack.push(num);
            index++;
            output.push({
                step: step,
                stack: [...stack],
                input: tokens.slice(index),
                action: `Shift ${operator}`
            });
        } 
        //reduce case -- wil grammar rules
        if (result[0]==('R')) {
            //get 2 from R2
            const num = parseInt(result.slice(1));
            //get the grammar rule according to the number
            const rule1 = rule[num];
            const count = rule1.right.length * 2;//number to pop off stack
            //eg:  stack = 0E1+6(4T2*7F10 ---> reduced by T->T*F
            //             state operator state operator
            //so we need to take off 6 index, 10 F 7 * 2 T
            //it becomes 0E1+6(4 --- end with state
            // and replace with new T, 4T->2 ------> so 0E1+6(4T2

            for (let i = 0; i < count; i++) 
                {
                    stack.pop(); //stack if LIFO
                }
            const last_state = stack[stack.length - 1];
            const next_state = goto_op(last_state, rule1.left);
            stack.push(rule1.left); //it was end with state, so continuing with operator
            stack.push(next_state); //then state

            output.push({
                step: step,
                stack: [...stack],
                input: tokens.slice(index),
                action: `Reduce by ${rule1.left} → ${rule1.right.join(' ')}` // join('') --> no seperator & converts output to single string
            });
        }
        step++; 
    }
}
//sumbit button feature
document.getElementById("sumbit").addEventListener("click", () => {    
    //import input from user 
    const realinput=document.getElementById("input").value;
    outputT.innerHTML = ""; //make sure clear any previous history
    start_parsing(realinput); // transfer parameter to the parsing function
    show_process();
});

//next buttom -- show each process one by one
document.getElementById("next").addEventListener("click", show_process);
function show_process() {
    if (current_step < output.length) {
        const step = output[current_step];
        output_table(step.step, step.stack.join(' '), step.input.join(' '), step.action);
        current_step++;
    } 
    else
    document.getElementById('next').disabled=true;
}

//step by step table---look for output table body in HTML by id 
const outputT = document.getElementById("data");
function output_table(step, stack, input, action) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${step}</td>
        <td>${stack}</td>
        <td>${input}</td>
        <td>${action}</td>
    `;
    //add the data to table
    outputT.appendChild(row);
}

function action_op(state, operator) {
    //Object.values() finding through numbers
    const list = Object.values(parsing_data).find(num => num.state == state);
    const result=list?.action[operator];//? -> only look for action if state is matched and defiend, and find the specific item
    return result;
}
//for reduce session, goto_op(last_state, rule1.left)
function goto_op(last_state, rule1_left) {
    const list = Object.values(parsing_data).find(num => num.state == last_state);
    const result=parseInt(list?.goto[rule1_left])
    return result; //return int
}