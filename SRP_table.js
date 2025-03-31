//my firstaim for this page is to create a SRP table 

function createSRPTable(data) {
    const table = document.createElement('table');
    table.style.width = '50%';
    table.style.textAlign = 'center';
    const style = document.createElement('style');
    style.textContent = `
        td,th {
            padding: 5px;
            border: 1px solid black;
            font-size: 20px;
        }
        th {
            background-color: pink;
        } 
    `; //style for the table

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

document.body.appendChild(createSRPTable(srpTableData));

