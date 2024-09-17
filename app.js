document.getElementById('fileInput').addEventListener('change', handleFileSelect);
document.getElementById('analyzeButton').addEventListener('click', analyzeContent);

let fileContent = '';

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            fileContent = e.target.result;
            document.getElementById('fileContent').textContent = fileContent;
        };
        reader.readAsText(file);
    }
}

function analyzeContent() {
    const tokens = tokenize(fileContent);
    displayTokens(tokens);
}

function tokenize(text) {
    //Tokens
    const tokensDef = {
        'entero': 'Palabra Reservada',
        'decimal': 'Palabra Reservada',
        'booleano': 'Palabra Reservada',
        'cadena': 'Palabra Reservada',
        'si': 'Palabra Reservada',
        'sino': 'Palabra Reservada',
        'mientras': 'Palabra Reservada',
        'hacer': 'Palabra Reservada',
        'verdadero': 'Palabra Reservada',
        'falso': 'Palabra Reservada',
        '+': 'Operador',
        '-': 'Operador',
        '*': 'Operador',
        '/': 'Operador',
        '%': 'Operador',
        '=': 'Operador',
        '==': 'Operador',
        '<': 'Operador',
        '>': 'Operador',
        '>=': 'Operador',
        '<=': 'Operador',
        '(': 'Signos',
        ')': 'Signos',
        '{': 'Signos',
        '}': 'Signos',
        '"': 'Signos',
        ';': 'Signos',
    };

    const lines = text.split('\n');
    const tokenCounts = {};

    lines.forEach(line => {
        const words = line.split(/\s+/);
        words.forEach(word => {
            if (tokensDef[word]) {
                const token = tokensDef[word];
                if (tokenCounts[word]) {
                    tokenCounts[word].count++;
                } else {
                    tokenCounts[word] = { type: token, count: 1 };
                }
            } else {
                console.warn(`Error léxico: token "${word}" no reconocido`); //comentario en consola si no lo reconoce como token
            }
        });
    });

    return tokenCounts;
}

function displayTokens(tokens) {
    const tableBody = document.querySelector('#tokenTable tbody');
    tableBody.innerHTML = '';  //limpiar tabla

    Object.keys(tokens).forEach(token => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${token}</td><td>${tokens[token].type}</td><td>${tokens[token].count}</td>`;
        tableBody.appendChild(row);
    });
}